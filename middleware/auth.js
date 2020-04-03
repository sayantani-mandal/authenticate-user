const jwt = require('jsonwebtoken');
//const config = require('config');

function auth(req,res,next){
const token = req.header('token');

if(!token) return res.status(401).send('access denied. no token provided');

try{

    const decoded = jwt.verify(token, "vidly_jwtPrivateKey");
    console.log(decoded);
    req.mails = decoded;
    next();
}
catch(ex){
    res.status(400).send('Invalid token..');
}

}

module.exports = auth;