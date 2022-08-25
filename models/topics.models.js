const db = require('../db/connection.js');
const format = require('pg-format')
const { isPositiveInt } = require('../utils/data-validation');

exports.fetchTopics=(limit=10,page=1) =>{

    limit=parseInt(limit)
    page=parseInt(page)
    
    return isPositiveInt(limit,'limit','query').then(()=>{
        return isPositiveInt(page,'page','query')
    }).then(()=>{
        const formattedQuery=format(`SELECT * FROM topics LIMIT %L OFFSET %L`,limit,(page-1)*limit)
        return db.query(formattedQuery)
    }).then(({rows}) => {
        return rows;
    });
};

//TODO remove this function - duplicated work
exports.checkTopicExists=(topic) =>{
    const formattedQuery=format(`SELECT * FROM topics WHERE topics.slug LIKE %L`,topic)

    return db.query(formattedQuery).then(({rows}) => {
        if(rows.length===0){
            return Promise.reject({status:404,msg:"Non-existent topic"})
        }
        return rows;
    })
}

exports.fetchTopicBySlug=(slug)=>{

    const formattedQuery= format('SELECT * FROM topics WHERE topics.slug=%L',slug)

    return db.query(formattedQuery).then(({rows,rowCount})=>{
        if(rowCount===0){
            return Promise.reject({status:404,msg:'No topic exists with specified slug'})
        }
        return rows;
    })
}