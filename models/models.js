const db=require('../db/connection.js');
const format=require('pg-format')

exports.fetchTopics=(limit=10,page=1) =>{

    limit=parseInt(limit)
    if(!Number.isInteger(limit) || limit<1){
        return Promise.reject({status:400,msg:'Invalid limit query'})
    }

    page=parseInt(page)
    if(!Number.isInteger(page) || page<1){
        return Promise.reject({status:400,msg:'Invalid page query'})
    }

    const formattedQuery=format(`SELECT * FROM topics LIMIT %L OFFSET %L`,limit,(page-1)*limit)
    
    return db.query(formattedQuery).then(({rows}) => {
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
        return rows;
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

    return this.fetchArticleById(article_id).then(()=>{
        return db.query(formattedQuery)
    .then(({rows})=> {
        return rows
    })});
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

    return this.checkTopicExists(topic).then(()=>{
        return this.checkColumnExists('articles',sort_by)

    }).then(()=>{
        order=order.toUpperCase();
        if(order!== 'ASC' && order!=='DESC'){
            return Promise.reject({status:400,msg:'Invalid order'})
        }

        limit= parseInt(limit)
        if(!Number.isInteger(limit) || limit<0){
            return Promise.reject({status:400,msg:'Invalid limit query'})
        }

        page= parseInt(page)
        if(!Number.isInteger(page) || page<1){
            return Promise.reject({status:400,msg:'Invalid page query'})
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

exports.fetchUserByUsername=(username)=>{

    if(typeof username !== 'string'){
        return Promise.reject({status:400,msg:'Invalid username'})
    }

    return db.query('SELECT * FROM users WHERE users.username=$1',[username]).then(({rows,rowCount})=>{
        if(rowCount===0) {
            return Promise.reject({status:404,msg:'Non-existent username'});
        }
        return rows
    })
}

exports.addCommentByArticleId=(article_id,comment)=>{

    //Did they say in lecture that pg-format sanitises input to protect against
    //SQL injection?

    const formattedQuery=format(`INSERT INTO comments
    (body,article_id,author) VALUES %L RETURNING *`,[[comment.body,article_id,comment.username]]);

    return this.fetchArticleById(article_id).then(()=>{
        if(typeof comment.body !== 'string' || typeof comment.username !== 'string'){
            return Promise.reject({status:400,msg:'Invalid POST body'})
        }
    }).then(()=>{
        return this.fetchUserByUsername(comment.username);
    }).then(()=>{
        return db.query(formattedQuery)
    }).then(({rows})=> {
        return rows
    })
}

exports.checkTopicExists=(topic) =>{
    const formattedQuery=format(`SELECT * FROM topics WHERE topics.slug LIKE %L`,topic)

    return db.query(formattedQuery).then(({rows}) => {
        if(rows.length===0){
            return Promise.reject({status:404,msg:"Non-existent topic"})
        }
        return rows;
    })
}

exports.checkColumnExists=(table,column) => {
 //opted for slower solution but less upkeep if additional fields added to articles table etc

    const formattedQuery=format(`SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = %L`,table)

    return db.query(formattedQuery).then(({rows})=>{
        if(!rows.find((col)=> col.column_name===column)){
            return Promise.reject({status:400,msg:'Invalid sort_by column'});
        }
        return rows;
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

exports.fetchApi=()=>{
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