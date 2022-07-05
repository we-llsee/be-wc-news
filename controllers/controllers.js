const models=require('../models/models.js')

exports.getTopics =(req,res) => {

    return models.fetchTopics().then((topics)=>{
        return res.status(200).send({topics});
    });
}

exports.getArticleById=(req,res,next) => {

    const {article_id} =req.params;

    if(Number.isNaN(+article_id)){
        next({status:400, msg:'Invalid article_id'})
        return ;
    }

    return models.fetchArticleById(article_id).then(({rowCount,rows:[article]})=>{    
        if(rowCount===0) return res.status(404).send({'article':{}});
        return res.status(200).send({article});
    });

};

exports.patchArticleById=(req,res,next) =>{

    const {article_id} =req.params;
    const {inc_votes} = req.query;

    if(req.query.keys.length>1 || Number.isNaN(+inc_votes)) {
        next({status:400, msg:'Invalid PATCH body'})
        return ;
    }

    return models.updateArticleById(inc_votes,article_id).then(({rows:[article]})=>{
        return res.status(200).send({article});
    });
}