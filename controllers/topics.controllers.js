const { fetchTopics, fetchTopicBySlug } = require('../models/topics.models')

exports.getTopics=(req,res,next) => {

    const {limit}= req.query;
    const {p} = req.query;

    return fetchTopics(limit,p).then((topics)=>{
        return res.status(200).send({topics});
    }).catch(err=>next(err))
}

exports.getTopicBySlug=(req,res,next)=>{

    const {slug} = req.params;

    fetchTopicBySlug(slug).then(([topic])=>{
        res.status(200).send({topic})
    }).catch((err)=>next(err));
    
}

