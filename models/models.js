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