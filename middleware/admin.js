function admin(req,res,next){
    console.log(req.body.isAdmin);
    if(!req.body.isAdmin) return res.status(403).send('access denied..');

    next();
};

module.exports = admin

