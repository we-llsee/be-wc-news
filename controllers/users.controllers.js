const models=require('../models/models.js')

exports.getUsers=(req,res,next) => {
    models.fetchUsers().then((users)=> {
        return res.status(200).send({users})
    });
}