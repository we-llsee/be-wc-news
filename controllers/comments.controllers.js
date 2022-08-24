const models=require('../models/models.js')

exports.getCommentsByArticleId = (req,res,next) => {
    const {article_id}=req.params;
    const {limit}=req.query;
    const {p}=req.query;
    
    models.fetchCommentsByArticleId(article_id,limit,p).then(comments=>{
        res.status(200).send({comments})
    }).catch((err) => {
       next(err) 
    });
}

exports.postCommentByArticleId=(req,res,next)=>{
    const {article_id} =req.params;
    const comment= req.body;

    models.addCommentByArticleId(article_id,comment).then(([comment])=>{
        res.status(200).send({comment})
    }).catch((err)=> next(err));
}

exports.deleteCommentByCommentId=(req,res,next) =>{

    const {comment_id}=req.params;

    models.removeCommentByCommentId(comment_id).then(()=>{
        res.status(204).send({});
    }).catch((err)=>{
        next(err);
    })
}

exports.patchCommentById=(req,res,next)=>{

    const {comment_id} = req.params;
    const {inc_votes} = req.body;

    models.updateCommentById(comment_id,inc_votes).then((comment)=>{
        res.status(200).send({comment});
    }).catch(err => {
        next(err);
    })
}
