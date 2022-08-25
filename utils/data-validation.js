exports.isPositiveInt=(value,field,detail='')=>{

    if(Number.isInteger(value) && value > 0){
        return Promise.resolve();
    } 

    if(detail!=="") detail += " ";
    return Promise.reject({status:400,msg:`Invalid '${field}' ${detail}- not a positive integer`})
}

exports.isString=(value,field,detail='')=>{

    if(typeof value === 'string'){ 
        return Promise.resolve();
    }

    if(detail!=="") detail += " ";
    return Promise.reject({status:400,msg:`Invalid '${field}' ${detail}- not a string`})
}

exports.isInt=(value,field,detail='')=>{

    if(Number.isInteger(value)){
        return Promise.resolve();
    } 

    if(detail!=="") detail += " ";
    return Promise.reject({status:400,msg:`Invalid '${field}' ${detail}- not an integer`})
}