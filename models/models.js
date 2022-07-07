const db=require('../db/connection.js');
const query=require('pg-format')

exports.fetchTopics=() =>{
    return db.query('SELECT * FROM topics').then(({rows}) => {
        return rows;
    });
};

exports.fetchArticleById = (article_id) => {
    return db.query('SELECT * FROM articles WHERE article_id=$1',[article_id]);
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

exports.fetchCommentsByArticleId=(article_id)=>{

    if(Number.isNaN(+article_id)){ 
        return Promise.reject({status:400,msg:'Invalid article_id'})
    }

    return this.fetchArticleById(article_id).then(()=>{
        return db.query('SELECT * FROM comments WHERE comments.article_id=$1',[article_id])
    .then(({rows})=> {
        return rows
    })});
    
}