const Jwt = require("jsonwebtoken");
function verifyToken(req, res, next) {
  let authHeader = req.headers["auth-token"];
  if (authHeader == undefined) {
    res.status(401).send("No Token Provided");
  }  
  let token = authHeader;
  Jwt.verify(token, process.env.JWT_SECRET, (err, ress) => {
    if (err) {
      console.log(err);
      res.status(404).send("unauthorized"); 
    } else {
      next();
    }
  });
}
module.exports = { verifyToken };
