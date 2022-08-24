const models=require('../models/models.js')

exports.getArticleById=(req,res,next) => {
    const {article_id} =req.params;

    return models.fetchArticleById(article_id)
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

exports.getArticles=(req,res,next) => {

    const {sort_by}=req.query;
    const {order}=req.query;
    const {topic}=req.query;
    const {limit}=req.query;
    const {p}=req.query;

    models.fetchArticles(sort_by,order,topic,limit,p).then(({articles,total_count})=>{
        res.status(200).send({articles,total_count});
    }).catch((err)=>next(err));
}

