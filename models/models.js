const db=require('../db/connection.js');
const format=require('pg-format')

exports.fetchTopics=() =>{
    return db.query('SELECT * FROM topics').then(({rows}) => {
        return rows;
    });
};

exports.fetchArticleById = (article_id) => {

    if(Number.isNaN(+article_id)){
        return Promise.reject({status:400, msg:'Invalid article_id'})
    }

    const formattedQuery=format(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
    LEFT JOIN comments 
    ON articles.article_id=comments.article_id
    WHERE articles.article_id=%L
    GROUP BY articles.article_id`,[[article_id]]);

    return db.query(formattedQuery).then(({rowCount,rows})=> {
        if(rowCount===0) return Promise.reject({status:404,msg:'Non-existent article_id'});
        return rows
    });

}

exports.fetchUsers = ()=>{
    return db.query('SELECT * FROM users').then(({rows}) => {
        return rows;
    })
}

exports.updateArticleById = (inc_votes,article_id) => {
    return db.query('UPDATE articles SET votes=votes+$1 WHERE article_id=$2 RETURNING *',[inc_votes,article_id]).then((result)=>{
        if(!result.rows[0]) return Promise.reject({status:404,msg:'Non-existent article_id'});
        return result;
    });
}

exports.fetchArticles=()=>{
    const formattedQuery=format(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
    LEFT JOIN comments 
    ON articles.article_id=comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC`);

    return db.query(formattedQuery).then(({rows})=> {
        rows=rows.map((article)=> {
            article.comment_count = +article.comment_count;
            return article;
        })
        return rows;
    });
}