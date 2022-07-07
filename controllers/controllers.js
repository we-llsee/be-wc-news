const models=require('../models/models.js')

exports.getTopics =(req,res) => {
    return models.fetchTopics().then((topics)=>{
        return res.status(200).send({topics});
    });
}

exports.getArticleById=(req,res,next) => {
    const {article_id} =req.params;

    return Promise.resolve().then(()=>{
        if(Number.isNaN(+article_id)){
            return Promise.reject({status:400, msg:'Invalid article_id'})
        }
    }).then(()=>{
        return models.fetchArticleById(article_id)
    }).then((article)=>{    
        return res.status(200).send({article:article[0]});
    }).catch((err)=>{
        next(err);
    })

};

exports.patchArticleById=(req,res,next) =>{
    const {article_id} =req.params;
    const {inc_votes} = req.query;
    
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
