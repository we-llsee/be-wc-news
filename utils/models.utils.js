const db = require('../db/connection.js');
const format = require('pg-format')

exports.checkDbColumnExists=(table,column) => {
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