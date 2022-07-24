const controllers=require('./controllers/controllers')
const db= require('./db/connection.js')

endpointRequest(controllers.getArticleById,{article_id:1})

function endpointRequest(controllerFn,params){
    const req={params: params}

    const res={ statusCode:0,
                body:'',
                status:function(code){
                    this.statusCode=code;
                    return {...this}
                },
                send:function(sendBody){
                    this.body=sendBody
                    return {...this}
                }
            }
    
    const next=(err)=>{
        console.log(err);
    }

    //console.log(res.status(23).send({msg:'hello'}))

    return controllerFn(req,res,next).then(resResponse=>{
    
        console.log(resResponse);
        return resResponse
    })
}

    //db.end();
//endpointRequest(()=>{},{article_id:1})