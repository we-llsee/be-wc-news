const models=require('../models/models.js')

exports.getTopics =(req,res) => {

    return models.fetchTopics().then((topics)=>{
        return res.status(200).send({topics});
    });
}