const request = require('supertest')

const app = require('../app.js');
const db = require('../db/connection.js')
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed');

const usersTests=()=>{
    describe('GET /api/users',() => {
        it('200: GET /api/users',() => {
            return request(app).get('/api/users').expect(200);
        });

        it('200: returns array of user objects',() => {
           return request(app).get('/api/users').expect(200).then(({body:{users}})=>{
                expect(users.length===4).toBe(true);    
                users.forEach(user =>{
                    expect(user).toEqual(expect.objectContaining({
                        username:expect.any(String),
                        name:expect.any(String),
                        avatar_url:expect.any(String)
                    }))
                })
            })
        });

        it('200: when user table is empty returns: {users:[]}',() => {
            return db.query('DELETE FROM comments').then(()=>{
                return db.query('DELETE FROM articles');
            }).then(() => {
                return db.query('DELETE FROM users')
            }).then(() => {
                return request(app).get('/api/users').expect(200)
            }).then(data => {
                return expect(data.body).toEqual({users:[]})
            }).then(()=>{
                return seed(testData);
            })
        });
    })
}

module.exports = { usersTests } 