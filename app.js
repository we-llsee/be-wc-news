const express=require('express');
const app = express();
const controllers = require('./controllers/controllers.js');

app.get('/api/topics',controllers.getTopics);

app.get('/api/articles/:article_id',controllers.getArticleById);

app.use((err,req,res,next)=>{
    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

module.exports=app;