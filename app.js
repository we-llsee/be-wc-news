const express=require('express');
const app = express();
const controllers = require('./controllers/controllers.js');
const cors = require('cors');

// const apiRouter= require('./api-router')
// app.use('/api',apiRouter);

app.use(cors());

app.use(express.json());

app.get('/api/topics',controllers.getTopics);
app.get('/api/articles/:article_id',controllers.getArticleById);
app.get('/api/users',controllers.getUsers);
app.get('/api/articles/:article_id/comments',controllers.getCommentsByArticleId)
app.get('/api/articles',controllers.getArticles);
app.get('/api',controllers.getApi)
app.get('/api/topics/:slug',controllers.getTopicBySlug)

app.patch('/api/articles/:article_id',controllers.patchArticleById);
app.patch('/api/comments/:comment_id',controllers.patchCommentById);

app.post('/api/articles/:article_id/comments',controllers.postCommentByArticleId)

app.delete('/api/comments/:comment_id',controllers.deleteCommentByCommentId)

app.use((err,req,res,next)=>{

    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

module.exports=app;