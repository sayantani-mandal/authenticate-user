const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const passwordComplexity = require('joi-password-complexity');



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 250
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 2250
    },
    otp: String,
    expiredTime: {
        type : Date
    },
    myImage: {
        type: String
        //required: true
    },

    tokens: [{
        token:{ 
            type: String,
            required: true
        }          
        
    }]

});



userSchema.methods.genrtateAuthToken = async function(){
    const user = this;
	const token = jwt.sign({_id: this._id, mail: this.mail },"vidly_jwtPrivateKey");
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}


const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        mail: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
      //  myImage : Joi.string().required()
    });

    return schema.validate(user);
}

function validatePassword(user) {
    const complexityOptions = {
      min: 4,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      //requirementCount: 2,
    };
  
    return passwordComplexity(complexityOptions).validate(user.password);
  }

exports.User = User ;
exports.validate = validateUser ;
exports.validatePassword = validatePassword ;