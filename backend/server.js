const dotenv = require('dotenv');
// Load environment variables immediately at startup
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Sync Database
sequelize.sync({ alter: true })
    .then(() => console.log('✅ SQLite/PostgreSQL Database Synced Successfully.'))
    .catch(err => console.error('❌ Database Sync Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/user', require('./routes/user'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/insights', require('./routes/insights'));

app.get('/', (req, res) => {
    res.send('FinSight AI Platform API is running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
