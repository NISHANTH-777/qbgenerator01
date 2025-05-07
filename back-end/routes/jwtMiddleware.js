const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; 

const verifyToken = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers['authorization']?.split(' ')[1]; 

  // Log the token for debugging
  console.log("Token from request header:", token); // <-- Add this line to debug

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    } 

    // Log decoded data for debugging
    console.log("Decoded token:", decoded); // <-- Add this line to debug

    req.user = decoded; // Attach user info from the token to the request object
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = verifyToken;
