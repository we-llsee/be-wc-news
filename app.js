const express=require('express');
const app = express();
const controllers = require('./controllers/controllers.js');

// const apiRouter= require('./api-router')
// app.use('/api',apiRouter);

app.get('/api/topics',controllers.getTopics);
app.get('/api/articles/:article_id',controllers.getArticleById);

app.get('/api/users',controllers.getUsers);
app.patch('/api/articles/:article_id',controllers.patchArticleById);

app.use((err,req,res,next)=>{
    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

module.exports=app;