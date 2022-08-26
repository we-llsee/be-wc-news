const express = require('express');
const app = express();
const cors = require('cors');

const { apiRouter } = require('./routes/api.router')
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
app.use('/api',apiRouter)


app.use((err,req,res,next)=>{
    if(err.status && err.msg){
        return res.status(err.status).send({msg:err.msg});
    } else {
        next(err);
    }
});

app.use((err,req,res,next)=>{
    console.log(err);
    return res.status(500).send({msg:"Server Error"})
})

module.exports=app;