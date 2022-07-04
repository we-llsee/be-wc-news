const express=require('express');
const app = express();
const controllers = require('./controllers/controllers.js');

app.get('/api/topics',controllers.getTopics);

module.exports=app;