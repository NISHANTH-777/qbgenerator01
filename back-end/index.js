const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());;

const authRoutes = require('./routes/auth');
const facultyRoutes = require('./routes/faculty') ;
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);


app.listen(7000, () => {
  console.log("🚀 Server running on http://localhost:7000");
});