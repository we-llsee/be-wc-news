const format = require('pg-format')

const db = require('../db/connection.js');
const { checkDbColumnExists } = require('../utils/models.utils')
const { checkTopicExists } = require('./topics.models')
const { isPositiveInt } = require('../utils/data-validation')

exports.fetchArticleById = (article_id) => {
    const formattedQuery=format(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
    LEFT JOIN comments 
    ON articles.article_id=comments.article_id
    WHERE articles.article_id=%L
    GROUP BY articles.article_id`,[[article_id]]);

    article_id= parseInt(article_id)

    return isPositiveInt(article_id,'article_id','parameter').then(()=>{
        return db.query(formattedQuery)
    }).then(({rowCount,rows})=> {
        if(rowCount===0) {
            return Promise.reject({status:404,msg:'Non-existent article_id'})
        }
        return rows;
    });

}

exports.updateArticleById = (inc_votes,article_id) => {
    return db.query('UPDATE articles SET votes=votes+$1 WHERE article_id=$2 RETURNING *',[inc_votes,article_id]).then((result)=>{
        if(!result.rows[0]) {
            return Promise.reject({status:404,msg:'Non-existent article_id'})
        }
        return result;
    });
}

exports.fetchArticles=(sort_by='created_at',order='DESC',topic='%',limit=10,page=1)=>{

    let total_count;

    const buildArticlesQuery=(sort_by,order,topic,limit,offset) =>{
        return format(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
        LEFT JOIN comments 
        ON articles.article_id=comments.article_id
        WHERE articles.topic LIKE %L
        GROUP BY articles.article_id
        ORDER BY articles.%I %s
        LIMIT %s OFFSET %L`,topic,sort_by,order,limit,offset);
    }
    //TODO promise.all this?
    return checkTopicExists(topic).then(()=>{
        return checkDbColumnExists('articles',sort_by)
    }).then(()=>{
        limit= parseInt(limit)
        return isPositiveInt(limit,'limit','query')
    }).then(()=>{
        page= parseInt(page)
        return isPositiveInt(page,'page','query')
    }).then(()=>{
        order=order.toUpperCase();
        if(order!== 'ASC' && order!=='DESC'){
            return Promise.reject({status:400,msg:'Invalid order'})
        }
    }).then(()=>{
        //TODO check fully sanitised
        return db.query(buildArticlesQuery(sort_by,order,topic,"ALL",0))
}).then((res)=>{
        total_count= res.rowCount
        let offset= (page-1) * limit
        return db.query(buildArticlesQuery(sort_by,order,topic,limit,offset))
    }).then(({rows})=> {
        return  {total_count,
                articles:   rows.map((article)=> {
                                article.comment_count = +article.comment_count;
                                return article;
                            })
                }
    });
}