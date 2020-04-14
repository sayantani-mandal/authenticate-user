


function generateOtp(email){
    const otpGenerator = require('otp-generator');
    const sendEMail = require('./sendMail');

    const token = otpGenerator.generate(4, {upperCase: false, alphabets: false, specialChars: false});
    console.log(token);
    sendEMail(token, email).catch(console.error);
    return token;
}

//generateOtp('ssaayyantani@gmail.com');

module.exports = generateOtp;