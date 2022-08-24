const db = require('../db/connection.js');
const format = require('pg-format')

exports.fetchUsers = ()=>{
    return db.query('SELECT * FROM users').then(({rows}) => {
        return rows;
    })
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