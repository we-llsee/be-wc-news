const express=require('express');
const app = express();
const { getTopics, getTopicBySlug } = require('./controllers/topics.controllers')
const { getArticleById, getArticles, patchArticleById } = require('./controllers/articles.controllers')
const { getUsers } = require('./controllers/users.controllers')
const { getCommentsByArticleId, patchCommentById, postCommentByArticleId, deleteCommentByCommentId } = require('./controllers/comments.controllers')
const { getApi } = require('./controllers/api.controllers')

const cors = require('cors');

app.use(cors());

app.use(express.json());

app.get('/api/topics',getTopics);
app.get('/api/articles/:article_id',getArticleById);
app.get('/api/users',getUsers);
app.get('/api/articles/:article_id/comments',getCommentsByArticleId)
app.get('/api/articles',getArticles);
app.get('/api',getApi)
app.get('/api/topics/:slug',getTopicBySlug)

app.patch('/api/articles/:article_id',patchArticleById);
app.patch('/api/comments/:comment_id',patchCommentById);

app.post('/api/articles/:article_id/comments',postCommentByArticleId)

app.delete('/api/comments/:comment_id',deleteCommentByCommentId)

app.use((err,req,res,next)=>{

    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

module.exports=app;