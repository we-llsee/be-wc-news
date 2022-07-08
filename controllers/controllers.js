const models=require('../models/models.js')

exports.getTopics =(req,res) => {
    return models.fetchTopics().then((topics)=>{
        return res.status(200).send({topics});
    });
}

exports.getArticleById=(req,res,next) => {
    const {article_id} =req.params;

    models.fetchArticleById(article_id)
    .then((article)=>{    
        article[0].comment_count = +article[0].comment_count
        return res.status(200).send({article:article[0]});
    }).catch((err)=>{
        next(err);
    })

};

exports.patchArticleById=(req,res,next) =>{
    const {article_id} =req.params;
    const {inc_votes} = req.body;
    
    return Promise.resolve().then(()=>{
        if(Number.isNaN(+article_id)){
            return Promise.reject({status:400, msg:'Invalid article_id'})
        }  
        
        if(Number.isInteger(+inc_votes)===false){
            return Promise.reject({status:400, msg:'Invalid PATCH body'})
        }
    }).then(()=>{
        return models.updateArticleById(inc_votes,article_id)
    }).then(({rows:[article]})=>{
        return res.status(200).send({article});
    }).catch((err) => next(err))
   
}

exports.getUsers=(req,res,next) => {
    models.fetchUsers().then((users)=> {
        return res.status(200).send({users})
    });
}

exports.getCommentsByArticleId = (req,res,next) => {
    const {article_id}=req.params;
    
    models.fetchCommentsByArticleId(article_id).then(comments=>{
        res.status(200).send({comments})
    }).catch(err => next(err));
}

exports.getArticles=(req,res,next) => {
    models.fetchArticles().then(articles=>{
        res.status(200).send({articles});
    });
}

exports.postCommentByArticleId=(req,res,next)=>{
    const {article_id} =req.params;
    const comment= req.body;

    models.addCommentByArticleId(article_id,comment).then(([comment])=>{
        res.status(200).send({comment})
    }).catch((err)=> next(err));
}
