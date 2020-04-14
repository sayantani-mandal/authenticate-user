//const Joi = require('@hapi/joi');
///const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/users');
const login = require('./routes/login');
const app = express();
app.use(express.json());

app.use('/api/mails',users);
app.use('/api/login',login);
app.use('/uploads', express.static('uploads'));


mongoose.connect('mongodb://localhost/MAILMAIL', {useNewUrlParser:true , useUnifiedTopology : true})
.then(() => console.log('connected to mongdb...'))
.catch(err => console.error('not connected to mongodb...'));





port = 3005;
app.listen(port,()=>console.log(`server is running on port ${port}`));

