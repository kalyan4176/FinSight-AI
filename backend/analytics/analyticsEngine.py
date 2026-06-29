import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression

def calculate_financial_health_score(expenses_df, salary):
    """
    Computes a financial health score from 0 to 100 based on:
    1. Savings rate (40% weight): Target >= 20%
    2. Discretionary vs. Essential spending ratio (35% weight): Target discretionary <= 30% of income
    3. Spend volatility (25% weight): Lower volatility of discretionary spending is better
    """
    if salary <= 0:
        return 50, "Neutral" # Baseline

    total_spend = expenses_df['amount'].sum() if not expenses_df.empty else 0
    savings = max(0, salary - total_spend)
    savings_rate = (savings / salary) * 100

    # 1. Savings Rate Score (Max 40 points)
    # Target 30% savings rate for full points
    savings_score = min(40, (savings_rate / 30.0) * 40.0) if savings_rate > 0 else 0

    # 2. Discretionary Spending Score (Max 35 points)
    # Essential vs Discretionary
    if not expenses_df.empty and 'isDiscretionary' in expenses_df.columns:
        disc_spend = expenses_df[expenses_df['isDiscretionary'] == True]['amount'].sum()
    else:
        # Fallback: assume shopping, entertainment, travel are discretionary (approx. 40% of standard categories)
        disc_categories = ['Shopping', 'Entertainment', 'Travel', 'Other']
        disc_spend = expenses_df[expenses_df['category'].isin(disc_categories)]['amount'].sum() if not expenses_df.empty else 0

    disc_ratio = (disc_spend / salary) * 100
    # If discretionary spend is <= 20% of salary, full 35 points.
    # Linear penalty if discretionary spend exceeds 20%
    if disc_ratio <= 20:
        disc_score = 35
    else:
        disc_score = max(0, 35 - ((disc_ratio - 20) / 40.0) * 35.0)

    # 3. Spend Volatility Score (Max 25 points)
    # Calculate day-over-day volatility of spending
    if not expenses_df.empty and len(expenses_df) > 3:
        # Group by date to get daily spend
        daily_spend = expenses_df.groupby('date')['amount'].sum()
        if len(daily_spend) > 1:
            volatility = daily_spend.std()
            # Score volatility: lower std dev relative to average spend is better
            mean_daily = daily_spend.mean()
            if mean_daily > 0:
                cv = volatility / mean_daily # Coefficient of variation
                volatility_score = max(0, 25 - (cv * 10.0))
            else:
                volatility_score = 25
        else:
            volatility_score = 20
    else:
        volatility_score = 20

    final_score = int(round(savings_score + disc_score + volatility_score))
    final_score = max(0, min(100, final_score))

    if final_score >= 80:
        label = "Excellent"
    elif final_score >= 60:
        label = "Good"
    elif final_score >= 40:
        label = "Fair"
    else:
        label = "Needs Attention"

    return final_score, label

def forecast_expenses(expenses_df, salary):
    """
    Uses Scikit-learn LinearRegression to forecast the next month's spending
    by analyzing day-over-day/week-over-week trends.
    """
    if expenses_df.empty:
        return 0, []

    # Parse and sort dates
    expenses_df['date'] = pd.to_datetime(expenses_df['date'])
    expenses_df = expenses_df.sort_values('date')

    # Group expenses by date (daily total)
    daily_spend = expenses_df.groupby('date')['amount'].sum().reset_index()

    # If we have very little data (less than 3 days), fallback to historical daily average * 30
    if len(daily_spend) < 3:
        avg_daily = daily_spend['amount'].mean()
        forecasted_total = avg_daily * 30
        
        # Mock daily forecast data points
        today = datetime.now()
        forecast_timeline = []
        for i in range(1, 31):
            future_date = (today + timedelta(days=i)).strftime('%Y-%m-%d')
            forecast_timeline.append({"date": future_date, "amount": round(float(avg_daily), 2)})
            
        return round(float(forecasted_total), 2), forecast_timeline

    # We have enough data for regression!
    # Convert dates to ordinal integers for regression
    daily_spend['ordinal'] = daily_spend['date'].map(datetime.toordinal)

    X = daily_spend['ordinal'].values.reshape(-1, 1)
    y = daily_spend['amount'].values

    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y)

    # Forecast next 30 days
    last_date = daily_spend['date'].max()
    future_ordinals = []
    forecast_timeline = []
    
    for i in range(1, 31):
        future_date = last_date + timedelta(days=i)
        future_ordinals.append(future_date.toordinal())
        
    future_ordinals_arr = np.array(future_ordinals).reshape(-1, 1)
    predicted_daily_amounts = model.predict(future_ordinals_arr)

    # Clean predicted values (no negative spend)
    predicted_daily_amounts = np.clip(predicted_daily_amounts, 0, None)
    
    total_forecasted = predicted_daily_amounts.sum()

    for i in range(30):
        future_date = (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d')
        forecast_timeline.append({
            "date": future_date,
            "amount": round(float(predicted_daily_amounts[i]), 2)
        })

    return round(float(total_forecasted), 2), forecast_timeline

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        data = json.loads(input_data)
        salary = float(data.get('salary', 0))
        expenses_raw = data.get('expenses', [])

        # Load into Pandas DataFrame
        if expenses_raw:
            expenses_df = pd.DataFrame(expenses_raw)
        else:
            expenses_df = pd.DataFrame(columns=['amount', 'date', 'category', 'isDiscretionary'])

        # Calculate analytics
        health_score, health_label = calculate_financial_health_score(expenses_df, salary)
        next_month_forecast, forecast_timeline = forecast_expenses(expenses_df, salary)

        # Statistics
        total_spend = float(expenses_df['amount'].sum()) if not expenses_df.empty else 0.0
        savings_rate = float(max(0.0, (salary - total_spend) / salary * 100)) if salary > 0 else 0.0

        # Discretionary spend category breakdown
        if not expenses_df.empty:
            category_totals = expenses_df.groupby('category')['amount'].sum().to_dict()
            category_breakdown = {k: float(v) for k, v in category_totals.items()}
        else:
            category_breakdown = {}

        output = {
            "healthScore": health_score,
            "healthLabel": health_label,
            "nextMonthForecast": next_month_forecast,
            "forecastTimeline": forecast_timeline,
            "statistics": {
                "totalSpend": total_spend,
                "savingsRate": round(savings_rate, 2),
                "income": salary,
                "categoryBreakdown": category_breakdown
            }
        }

        print(json.dumps(output))

    except Exception as e:
        # Handle exceptions gracefully and return error details
        import traceback
        error_output = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_output))

if __name__ == "__main__":
    main()
