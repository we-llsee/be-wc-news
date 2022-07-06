const app= require('../app.js');
const apiRouter=require('../api-router')
const request=require('supertest')
const db= require('../db/connection.js')
const testData=require('../db/data/test-data/index.js');
const seed=require('../db/seeds/seed');

beforeAll(()=>{
    return seed(testData);
});

afterAll(()=>{
    return db.end()
});

describe('Express app',() => {
   describe('GET /api/topics',() => {
    it('200: GET /api/topics',() => {
       return request(app).get('/api/topics').expect(200);
    });
    it('GET /api/topics returns an array',() => {
        return request(app).get('/api/topics').expect(200).then(({body}) =>{
            expect(Array.isArray(body.topics)).toBe(true);
            expect(body.topics.length > 0).toBe(true);
        })
    });
   
    it('GET /api/topics returns topic objects',() => {
        return request(app).get('/api/topics').expect(200).then(({body}) =>{
            body.topics.forEach(topic=>{
                expect(topic).toEqual(expect.objectContaining({
                    description:expect.any(String),
                    slug:expect.any(String),
                }));
            });
        });
    });

    // it('204: GET /api/topics when topics is empty',() => {
    //     return db.query('DELETE FROM comments').then(()=>{
    //         return db.query('DELETE FROM articles');
    //     }).then(() => {
    //         return db.query('DELETE FROM topics')
    //     }).then(() => {
    //         return request(app).get('/api/topics').expect(204);
    //     });
    // });
   });

   describe('GET /api/articles/:article_id',() => {
        it('200: /api/articles/1',() => {
            return request(app).get('/api/articles/1').expect(200)
        });

        it('/api/articles/1 returns the article object with article_id=1',() => {
            return request(app).get('/api/articles/1').expect(200).then(({body:{article}})=>{
                expect(article).toEqual(expect.objectContaining({
                    article_id:1,
                    author:expect.any(String),
                    title:expect.any(String),
                    body:expect.any(String),
                    topic:expect.any(String),
                    created_at:expect.any(String),
                    votes:expect.any(Number)
                }));    
            });
        });

        it('404: /api/articles/34567 returns {article:{}}',() => {
            return request(app).get('/api/articles/34567').expect(404).then(({body})=>{
                expect(body).toEqual({article:{}})
            });
        });

        it('400: /api/articles/abc returns {msg:"Invalid article_id"}',() => {
            return request(app).get('/api/articles/abc').expect(400).then(({body})=>{
                expect(body).toEqual({msg:"Invalid article_id"});
            });
        });
    });

    describe('GET /api/users',() => {
        it('200: GET /api/users',() => {
            return request(app).get('/api/users').expect(200);
        });

        it('200: returns array of user objects',() => {
           return request(app).get('/api/users').expect(200).then(({body:{users}})=>{
                expect(users.length>0).toBe(true);    
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
    });

    describe('PATCH /api/articles/:article_id',() => {
        it('200: /api/articles/1 when article_id exists',() => {
            return request(app).patch('/api/articles/1').query({inc_votes:1}).expect(200);
        });

        it('200: /api/articles/1 returns the article with article_id=1',() => {
            const patchPromise=request(app).patch('/api/articles/1').query({inc_votes:1});
            const getPromise=request(app).get('/api/articles/1');

            return Promise.all([patchPromise,getPromise]).then(([patchResult,getResult])=>{
                expect(patchResult.body).toEqual(getResult.body);
            });
        });

        it('200: /api/articles/1 returns article 1, updated as per the PATCH body',() => {
            const getPromise=request(app).get('/api/articles/1');
            const patchPromise=request(app).patch('/api/articles/1').query({inc_votes:10});

            return Promise.all([getPromise,patchPromise]).then(([getResult,patchResult])=>{
                expect(patchResult.body.article.votes).toBe(getResult.body.article.votes + 10);
            });
        });

        it('200: inc_votes in the PATCH body is a negative number',() => {
            const getPromise=request(app).get('/api/articles/1');
            const patchPromise=request(app).patch('/api/articles/1').query({inc_votes:-30});

            return Promise.all([getPromise,patchPromise]).then(([getResult,patchResult])=>{
                expect(patchResult.body.article.votes).toBe(getResult.body.article.votes -30);
            });
        });

        it('400: Empty PATCH body returns an "Invalid PATCH body" error',() => {
            return request(app).patch('/api/articles/1').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        });

        it('400: inc_votes key in PATCH body has an invalid value',() => {
            return request(app).patch('/api/articles/1').query({inc_votes:'cat'}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        });

        it('400: inc_votes key in PATCH body has no value',() => {
            return request(app).patch('/api/articles/1').query({inc_votes:undefined}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        })
        
        it('400: invalid article_id',() => {
            return request(app).patch('/api/articles/x').query({inc_votes:1}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid article_id'});
            })
        })
        
        it('404: non-existant article_id',() => {
            return request(app).patch('/api/articles/4566').query({inc_votes:1}).expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent article_id'});
            })
        })
    });
});
