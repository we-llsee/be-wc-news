const db = require('../db/connection.js');
const format = require('pg-format')

const { fetchArticleById } = require('./articles.models')
const { fetchUserByUsername } = require('./users.models')
const { isPositiveInt, isString, isInt } = require('../utils/data-validation')

exports.fetchCommentsByArticleId=(article_id,limit=10,page=1)=>{

    const formattedQuery=format(`SELECT * FROM comments 
    WHERE comments.article_id=%L 
    ORDER BY comments.created_at DESC
    LIMIT %s OFFSET %L`,article_id,limit,(page-1) * limit)

    page= parseInt(page)
    limit= parseInt(limit)
    return isPositiveInt(page,'page','query').then(()=>{
        return isPositiveInt(limit,'limit','query')
    }).then(()=>{
        return fetchArticleById(article_id)
    }).then(()=>{
        return db.query(formattedQuery)
    .then(({rows})=> {
        return rows
    })});
}

exports.addCommentByArticleId=(article_id,comment)=>{

    const formattedQuery=format(`INSERT INTO comments
    (body,article_id,author) VALUES %L RETURNING *`,[[comment.body,article_id,comment.username]]);

    return isString(comment.body,'body','property in POST body').then(()=>{
        return fetchArticleById(article_id)
    }).then(()=>{
        return isString(comment.username,'username','property in POST body')
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

    const formattedQuery = format(`SELECT * FROM comments WHERE comments.comment_id=%L`,comment_id)

    return isPositiveInt(comment_id,'comment_id','parameter').then(()=>{
        return db.query(formattedQuery)
    }).then((data)=>{
        if(data.rows.length===0) {
            return Promise.reject({status:404,msg:"Non-existent comment_id"});
        }
        return data.rows;
    })
}

exports.updateCommentById=(comment_id,inc_votes=0)=>{

    comment_id=parseInt(comment_id)
    inc_votes=parseInt(inc_votes)

    return isInt(inc_votes,'inc_votes','property in PATCH body').then(()=>{
        return this.getCommentById(comment_id)
    }).then(()=>{

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

    const formattedQuery=format(`SELECT * FROM comments WHERE comment_id=%L`,comment_id)

    return isPositiveInt(comment_id,'comment_id','parameter').then(()=>{
        return db.query(formattedQuery)
    }).then(({rows,rowCount})=>{
        if(rowCount===0){
            return Promise.reject({status:404, msg:'Comment_id not found'})
        }
        return rows
    })
}