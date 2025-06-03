const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors =require('cors');
require('./config/db');

// const userRoutes = require('./routes/userdataRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://camrilla-admin-dashboard.vercel.app',
  'https://camrilla-admin-dashboard-lime.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use('/api', userRoutes);  // <-- Important!

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
