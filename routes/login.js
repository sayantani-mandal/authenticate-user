const generateOtp = require('../middleware/otp');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Joi = require('@hapi/joi');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const router = express.Router();



router.post('/', auth , async (req,res)=> {
try{
    const id = req.user._id;
    console.log(id);
    let userId = await User.findById(id);
    if(!userId) return res.status(400).send({ Error: 'Invalid token provided' });

    const {error} = await validate(req.body);
    if(error) return res.status(400).send({ Error: error.details[0].message });

let user = await User.findOne({mail:req.body.mail});
console.log(user);
if(!user) return res.status(400).send({Error:'Invalid email..'});


const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ Error: 'Invalid password...' });

if(user.mail != req.user.mail)
    return res.status(400).send({ Error: 'Invalid token provided...' });

   const otp = generateOtp(req.body.mail);
console.log(otp);

user = await User.findByIdAndUpdate(
    user._id,
    { $set: { otp: otp ,expiredTime: Date.now() } },
    { new: true }
  );
    



res.send({ Success: `You are logged in ${user.name}` });



}
catch(e){
    res.status(402).send(e);
}
});

router.get('/me', auth , async (req,res) => {
try{

    const getOtp = req.header('otp');
    if(!getOtp) return res.status(401).send({Error:'no OTP provided'});

    //const date = Date.now();
    const id = req.user._id;
    console.log(id);
    const user =  await User.findById(id);
    if (!user) return res.status(400).send({ Error: 'Invalid token provided' });

if(getOtp != user.otp || Date.now() - user.expiredTime > 1000 * 60 * 2)
               return res.status(400).send({ Error: 'Invalid OTP provided' });



    res.send(_.pick(user, ['name', 'mail', 'myImage' ,'tokens']));
}
catch(e){
    res.status(402).send(e);
    console.log(e);
}
});

function validate(req) {

    const schema = Joi.object({
   
        mail : Joi.string().required().email(),
        password: Joi.string().required() 
    });
    return schema.validate(req);
}


module.exports = router;