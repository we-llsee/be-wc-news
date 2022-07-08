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
    it('200: /api/topics returns an array',() => {
        return request(app).get('/api/topics').expect(200).then(({body}) =>{
            expect(Array.isArray(body.topics)).toBe(true);
            expect(body.topics.length > 0).toBe(true);
        })
    });
   
    it('200: /api/topics returns topic objects',() => {
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

        it('200: /api/articles/1 returns the article object with article_id=1',() => {
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

       it('200: /api/articles/1 returns an article object with a comment_count key',() => {
            return request(app).get('/api/articles/1').then(({body})=>{
                expect(body.article).toHaveProperty('comment_count');
            })
        });

        it('200: /api/articles/3 comment_count=2',() => {
            return request(app).get('/api/articles/3').then(({body})=>{
                expect(body.article.comment_count).toBe(2);
            })
        });

        it('200: /api/articles/2 comment_count=0',() => {
            return request(app).get('/api/articles/2').then(({body})=>{
                expect(body.article.comment_count).toBe(0);
            })
        });

        it('400: /api/articles/abc returns {msg:"Invalid article_id"}',() => {
            return request(app).get('/api/articles/abc').expect(400).then(({body})=>{
                expect(body).toEqual({msg:"Invalid article_id"});
            });
        });

        it('404: /api/articles/34567',() => {
            return request(app).get('/api/articles/34567').expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent article_id'})
            });
        });
    });

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
    });

    describe('PATCH /api/articles/:article_id',() => {
        it('200: /api/articles/1 when article_id exists',() => {
            return request(app).patch('/api/articles/1').send({inc_votes:1}).expect(200);
        });

        it('200: /api/articles/1 returns the article with article_id=1',() => {
            let patchResult;
            let getResult;

           return request(app).patch('/api/articles/1').send({inc_votes:1}).then(({body})=>{
                patchResult=body;
                return request(app).get('/api/articles/1');
            }).then(({body})=>{
                getResult=body;
                return expect(getResult.article).toEqual(expect.objectContaining(patchResult.article));
            })
        });

        it('200: /api/articles/1 returns article 1, updated as per the PATCH body',() => {
            let getResult;
            let patchResult;

            return request(app).get('/api/articles/1').then(({body})=>{
                getResult=body;
                return request(app).patch('/api/articles/1').send({inc_votes:10});
            }).then(({body})=>{
                patchResult=body;
                return expect(patchResult.article.votes).toBe(getResult.article.votes + 10);
            });
        });

        it('200: inc_votes in the PATCH body is a negative number',() => {
            let getResult;
            let patchResult;

            return request(app).get('/api/articles/1').then(({body})=>{
                getResult=body;
                return request(app).patch('/api/articles/1').send({inc_votes:-30});
            }).then(({body})=>{
                patchResult=body;
                return expect(patchResult.article.votes).toBe(getResult.article.votes -30);
            })
        });

        it('200: /api/articles/8 hard coded test',() => {
            return request(app).patch('/api/articles/8').send({inc_votes:20}).expect(200).then(({body})=>{
                expect(body.article.votes).toBe(50);
            })
        });

        it('400: Empty PATCH body returns an "Invalid PATCH body" error',() => {
            return request(app).patch('/api/articles/1').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        });

        it('400: inc_votes key in PATCH body has an invalid value',() => {
            return request(app).patch('/api/articles/1').send({inc_votes:'cat'}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        });

        it('400: inc_votes key in PATCH body has no value',() => {
            return request(app).patch('/api/articles/1').send({inc_votes:undefined}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'});
            })
        })
        
        it('400: invalid article_id',() => {
            return request(app).patch('/api/articles/x').send({inc_votes:1}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid article_id'});
            })
        })
        
        it('404: non-existant article_id',() => {
            return request(app).patch('/api/articles/4566').send({inc_votes:1}).expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent article_id'});
            })
        })
    });

    describe('GET /api/articles/__article_id/comments',() => {
        it('200: /api/articles/1/comments returns {comments:[someArray]}',() => {
            return request(app).get('/api/articles/1/comments').expect(200).then(({body}) => {
                expect(body).toEqual({comments:expect.any(Array)})
            });
        });

        it('200: /api/articles/1/comments returns an array of "comment" objects',() => {
            return request(app).get('/api/articles/1/comments').expect(200).then(({body}) => {
                expect(body.comments.length).toBe(11);
                body.comments.forEach(comment=>{
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id:expect.any(Number),
                        votes:expect.any(Number),
                        created_at:expect.any(String),
                        author:expect.any(String),
                        body:expect.any(String)
                    }))
                })
            });
        });

        //is this a reasonable return to give?
        it('200: /api/articles/2/comments an article with no comments returns {comments:[]}',() => {
            return request(app).get('/api/articles/2/comments').expect(200).then(({body}) => {
                return expect(body).toEqual({comments:[]})
            });
        });

        it('400: /api/articles/cat/comments returns {msg:Invalid article_id}',() => {
            return request(app).get('/api/articles/cat/comments').expect(400).then(({body})=>{
                return expect(body).toEqual({msg:'Invalid article_id'})
            })
        });

        it('404: /api/articles/66666/comments returns {msg:Invalid article_id}',() => {
            return request(app).get('/api/articles/66666/comments').expect(404).then(({body})=>{
                return expect(body).toEqual({msg:'Non-existent article_id'})
            })
        });
    });
    
    describe('GET /api/articles',() => {
        it('200: /api/articles returns an array on a key of "articles"',() => {
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                expect(body).toEqual({articles:expect.any(Array)});
            })
        });

        it('200: /api/articles returns an array of "article" objects',() => {
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                body.articles.forEach((article)=>{
                    expect(article).toEqual(expect.objectContaining({
                        author:expect.any(String),
                        body:expect.any(String),
                        title:expect.any(String),
                        article_id:expect.any(Number),
                        topic:expect.any(String),
                        created_at:expect.any(String),
                        votes:expect.any(Number),
                        comment_count:expect.any(Number)
                    }));
                })
            })
        });

        it('200: /api/articles returns an array of length 12',() => {
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                expect(body.articles.length).toEqual(12);
            })
        });

        it('200: /api/articles returns {articles:[]} when articles table is empty',() => {
            return db.query('DELETE FROM comments').then(()=>{
                return db.query('DELETE FROM articles');
            }).then(() => {
                return request(app).get('/api/articles').expect(200)
            }).then(({body}) => {
                return expect(body).toEqual({articles:[]});
            }).then(()=>{
                return seed(testData);
            })
        });

        it('200: /api/articles returns array sorted by date in descending order',() => {
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                expect(body.articles).toBeSortedBy('created_at',{descending:true});
            })
        });
    });

    describe('GET /api/articles Queries',() => {
        it('200: GET /api/articles?sort_by=article_id',() => {
            return request(app).get('/api/articles?sort_by=article_id').expect(200).then(({body})=>{
                expect(body.articles).toBeSortedBy('article_id',{descending:true})
            })
        });

        it('200: GET /api/articles?order=ASC',() => {
            return request(app).get('/api/articles?order=ASC').expect(200).then(({body})=>{
                expect(body.articles).toBeSortedBy('created_at',{descending:false});
            })
        });

        it('200: GET /api/articles?order=asc order value can be in lower case',() => {
            return request(app).get('/api/articles?order=asc').expect(200).then(({body})=>{
                expect(body.articles).toBeSortedBy('created_at',{descending:false});
        })
        });

        
    });

    describe('POST /api/articles/__article_id/comments',() => {
        it('200: /api/articles/1/comments returns a comment object on a key of "comment"',() => {
            let postContent={
                body:'testing2',
                username:"butter_bridge",
            }
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(200).then(({body})=>{
                
                expect(body.comment).toEqual(expect.objectContaining({
                    comment_id:expect.any(Number),
                    body:'testing2',
                    article_id:1,
                    author:'butter_bridge',
                    votes:0,
                    created_at:expect.any(String)
                }))
            })
        });

        it('200: /api/articles/1/comments comment is successfully added to comments table',() => {
            let postContent={
                body:'testing3',
                username:"butter_bridge",
            }

            let postResult;
            let getResult;
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(200).then(({body})=>{
               postResult=body
            }).then(()=>{
                return request(app).get('/api/articles/1/comments').expect(200)
            }).then(({body})=>{
                getResult=body
                getResult= getResult.comments.find(comment=> comment.comment_id === postResult.comment.comment_id);
                expect(postResult).toEqual({comment:getResult});
            });
        });

        it('200: /api/articles/9/comments hard coded test',() => {
            let postContent={
                body:'hard coded test xqkj',
                username:"lurker",
            }

            return request(app).post('/api/articles/9/comments').send(postContent).expect(200).then(()=>{
                db.query(`SELECT * FROM comments WHERE body='hard coded test xqkj'`).then(({rows})=>{
                    expect(rows[0].author).toBe('lurker')
                })
            })

        });

        it('400: /api/articles/cat/comments article_id is invalid',() => {
            let postContent={
                body:'testing4',
                username:"butter_bridge",
            }
            
            return request(app).post('/api/articles/cat/comments').send(postContent).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid article_id'})
            });
        });

        it('400: /api/articles/cat/comments username in PATCH body is invalid',() => {
            let postContent={
                body:'testing5',
                username:1,
            }
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid POST body'})
            });
        });

        it('400: /api/articles/cat/comments body in PATCH body is invalid',() => {
            let postContent={
                body:false,
                username:'butter_bridge'
            }
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid POST body'})
            });
        });

        it('400: /api/articles/cat/comments PATCH body is empty is invalid',() => {
            let postContent={}
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid POST body'})
            });
        });

        it('404: /api/articles/66666/comments article_id is non-existent',() => {
            let postContent={
                body:'testing3',
                username:"butter_bridge",
            }
            
            return request(app).post('/api/articles/66666/comments').send(postContent).expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent article_id'})
            });
        });

        it('404: /api/articles/1/comments username in PATCH body does not exist',() => {
            let postContent={
                body:'testing88',
                username:"mike",
            }
            
            return request(app).post('/api/articles/1/comments').send(postContent).expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent username'})
            });
        });
    });
});

