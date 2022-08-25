const db = require('../db/connection.js');
const format = require('pg-format')

exports.fetchUsers = ()=>{
    return db.query('SELECT * FROM users').then(({rows}) => {
        return rows;
    })
}

//TODO sanitise input
exports.fetchUserByUsername=(username)=>{
    return db.query('SELECT * FROM users WHERE users.username=$1',[username]).then(({rows,rowCount})=>{
        if(rowCount===0) {
            return Promise.reject({status:404,msg:'Non-existent username'});
        }
        return rows
    })
}