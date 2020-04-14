const auth = require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcrypt');
const generateOtp = require('../middleware/otp');
const { User, validate , validatePassword } = require('../models/user');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const datetime = require('node-datetime');
const multer = require('multer');

const storage = multer.diskStorage({
destination: function(req, file, cb){

	const date = Date.now();
    const dt = datetime.create(date);
    const formatted = dt.format('d_m_yy');
    var dir = `./uploads/${formatted}`;
    mkdirp(dir)
      .then(() => {
        cb(null, dir);
      })
      .catch((err) => console.log(err));
	//cb(null, './uploads/');
},
filename: function(req, file ,cb){
const ext = file.originalname.split('.')[1];
cb(null, Date.now() + file.fieldname + '.' + ext);

}
});

const fileFilter = (req , file, cb) => {

	if(file.mimetype === 'image/jpeg' ||  file.mimetype === 'image/png'){
		cb(null,true);
	}
	else{
		cb( null,false);
	}
};

const upload = multer({
	storage: storage,
	limits:{
	fileSize: 1024 * 1024 * 5
},
    fileFilter:fileFilter
});

const router = express.Router();





router.post('/',upload.single('myImage'), async (req,res) => {
	try{

	const {error} = validate(req.body);
	if (error) return res.status(400).send({Error:error.details[0].message}); 

	const result = validatePassword(req.body);
	if (result.error) return res.status(400).send({Error:'password must contaion one uppercas,one lowercase,one numeric and one symbol'});

  let user = await User.findOne({mail:req.body.mail});
  if(user) return res.status(400).send({Error:'user is already registered'});

	 user = new User({
		name: req.body.name,
		mail: req.body.mail,
		password: req.body.password,
		myImage: req.file.path
		
	  });


	const salt = await bcrypt.genSalt(10);
	  user.password = await bcrypt.hash(user.password, salt);

	  //const otp = generateOtp(user.mail);
	  //user.otp = otp;
	  //console.log(otp);

	  const token = await user.genrtateAuthToken();
  	user = await user.save();

	  res.header('x-auth-token', token).send(_.pick(user, ['name', 'mail']));
	}
	catch(e){
		res.status(402).send(e);
	}
	
});



module.exports = router;