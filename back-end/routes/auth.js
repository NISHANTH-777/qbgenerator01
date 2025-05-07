const express = require('express');
const router = express.Router();
const db = require("../db"); 

router.post('/check-user', (req, res) => {
    const { email } = req.body;
  
    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
  
      if (results.length > 0) {
        const user = results[0];
        return res.json({
          exists: true,
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          course_code: user.course_code
        });
      } else {
        return res.json({ exists: false });
      }
    });
});
  
router.post('/manual-login', (req, res) => {
    const { email, password } = req.body;
  
    console.log("Login request:", email, password); 
  
    const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
      if (err) {
        console.error("MySQL error:", err); 
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
  
      const user = results[0];
      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          course_code: user.course_code
        }
      });
    });
});

module.exports = router;
