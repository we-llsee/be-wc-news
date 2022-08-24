const express = require('express');
const app = express();
const cors = require('cors');

const { getCommentsByArticleId, patchCommentById, postCommentByArticleId, deleteCommentByCommentId } = require('./controllers/comments.controllers')
const { getApi } = require('./controllers/api.controllers')
const { usersRouter } = require('./routes/users.router')
const { articlesRouter } = require('./routes/articles.router')
const { topicsRouter } = require('./routes/topics.router')
const { commentsRouter } = require('./routes/comments.router')


app.use(cors());
app.use(express.json());
app.use('/api/users',usersRouter)
app.use('/api/articles',articlesRouter)
app.use('/api/topics',topicsRouter)
app.use('/api/comments',commentsRouter)

app.get('/api',getApi)

app.get('/api/articles/:article_id/comments',getCommentsByArticleId)
app.post('/api/articles/:article_id/comments',postCommentByArticleId)


app.use((err,req,res,next)=>{
    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

module.exports=app;