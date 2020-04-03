const admin = require('./middleware/admin');
const auth = require('./middleware/auth');
const generateOtp = require('./middleware/otp');
///const config = require('config');
const express = require('express');
const jwt = require('jsonwebtoken');
//const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());


mongoose.connect('mongodb://localhost/MAILMAIL', {useNewUrlParser:true , useUnifiedTopology : true})
.then(() => console.log('connected to mongdb...'))
.catch(err => console.error('not connected to mongodb...'));



const mailSchema = new mongoose.Schema({
	name: String,
	mail: {
		type: String
	},
	password : String,
	isAdmin : Boolean,
	otp : String
});

mailSchema.methods.genrtateAuthToken = function(){
	const token = jwt.sign({_id: this._id, mail: this.mail , isAdmin : this.isAdmin},"vidly_jwtPrivateKey");
	return token;
}


const Mail = mongoose.model('Mail',mailSchema);


app.post('/api/mails', async (req,res) => {
	let mails = new Mail({...req.body}); 

	const salt = await bcrypt.genSalt(10);
	  mails.password = await bcrypt.hash(mails.password, salt);
	  const otp = generateOtp(req.body.mail);
	  mails.otp = otp;
  	await mails.save();

  	const token = mails.genrtateAuthToken();

  	res.send(token);
	
});

app.delete('/api/mails/:id', auth , async (req,res) => {
	const otp = req.headers.otp;
	if (!otp) return res.status(404).send('....not find otp');



	const mail = await Mail.findById(req.params.id);

	console.log(mail.otp);
	if(otp != mail.otp) return res.status(404).send('Invalid otp provided.....');
	
	const del = await Mail.findByIdAndRemove(req.params.id);
	if(!del) return res.status(404).send('...not find'); 
	

	res.send(del);

})

app.post('/api/login', auth, async (req, res) => {
	res.send(req.mails);
});





port = 3005;
app.listen(port,()=>console.log(`server is running on port ${port}`));

