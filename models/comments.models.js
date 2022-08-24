const db = require('../db/connection.js');
const format = require('pg-format')

const { fetchArticleById } = require('./articles.models')
const { fetchUserByUsername } = require('./users.models')

exports.fetchCommentsByArticleId=(article_id,limit=10,page=1)=>{

    page= parseInt(page)
    if(!Number.isInteger(page) || page<1){
        return Promise.reject({status:400,msg:"Invalid page query"})
    }

    limit= parseInt(limit)
    if(!Number.isInteger(limit) || limit<1){
        return Promise.reject({status:400,msg:"Invalid limit query"})
    }

    const formattedQuery=format(`SELECT * FROM comments 
    WHERE comments.article_id=%L 
    ORDER BY comments.created_at DESC
    LIMIT %s OFFSET %L`,article_id,limit,(page-1) * limit)

    return fetchArticleById(article_id).then(()=>{
        return db.query(formattedQuery)
    .then(({rows})=> {
        return rows
    })});
}

exports.addCommentByArticleId=(article_id,comment)=>{

    //Did they say in lecture that pg-format sanitises input to protect against
    //SQL injection?

    const formattedQuery=format(`INSERT INTO comments
    (body,article_id,author) VALUES %L RETURNING *`,[[comment.body,article_id,comment.username]]);

    return fetchArticleById(article_id).then(()=>{
        if(typeof comment.body !== 'string' || typeof comment.username !== 'string'){
            return Promise.reject({status:400,msg:'Invalid POST body'})
        }
    }).then(()=>{
        return fetchUserByUsername(comment.username);
    }).then(()=>{
        return db.query(formattedQuery)
    }).then(({rows})=> {
        return rows
    })
}

exports.removeCommentByCommentId=(comment_id)=>{
    
    comment_id=Number(comment_id);

    return this.fetchCommentByCommentId(comment_id).then(()=>{
        const formattedQuery=format('DELETE FROM comments WHERE comment_id=%L',comment_id)
        return db.query(formattedQuery)
    })
}

exports.fetchCommentByCommentId=(comment_id)=>{

    if(!Number.isInteger(comment_id)){
        return Promise.reject({status:400,msg:"Invalid comment_id"});
    }

    const formattedQuery = format(`SELECT * FROM comments WHERE comments.comment_id=%L`,comment_id)

    return db.query(formattedQuery).then((data)=>{
        
        if(data.rows.length===0) {
            return Promise.reject({status:404,msg:"Non-existent comment_id"});
        }

        return data.rows;
    })
}

exports.updateCommentById=(comment_id,inc_votes=0)=>{

    comment_id=parseInt(comment_id)
    inc_votes=parseInt(inc_votes)

    if(!Number.isInteger(inc_votes)){
        return Promise.reject({status:400,msg:'Invalid PATCH body'})
    }

    return this.getCommentById(comment_id).then(()=>{

        const formattedQuery=format(`UPDATE comments 
        SET votes=votes+%L
        WHERE comment_id=%L
        RETURNING *`,inc_votes,comment_id)

        return db.query(formattedQuery)
    }).then(({rows})=>{
        return rows[0]
    })
}  

exports.getCommentById=(comment_id)=>{

    if(!Number.isInteger(comment_id) || comment_id<1){
        return Promise.reject({status:400,msg:'Invalid comment_id'})
    }

    const formattedQuery=format(`SELECT * FROM comments WHERE comment_id=%L`,comment_id)

    return db.query(formattedQuery).then(({rows,rowCount})=>{
        if(rowCount===0){
            return Promise.reject({status:404, msg:'Comment_id not found'})
        }
        return rows
    })
}