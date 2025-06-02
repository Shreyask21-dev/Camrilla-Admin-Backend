const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors =require('cors');
require('./config/db');

// const userRoutes = require('./routes/userdataRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use('/api', userRoutes);  // <-- Important!

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
