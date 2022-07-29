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
            return request(app).get('/api/articles/1').then((data)=>{
                expect(data.body.article).toHaveProperty('comment_count');
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
                expect(body.comments.length).toBe(10);
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

        it('200: /api/articles/2/comments an article with no comments returns {comments:[]}',() => {
            return request(app).get('/api/articles/2/comments').expect(200).then(({body}) => {
                return expect(body).toEqual({comments:[]})
            });
        });

        //TODO add comment pagination
        it('200 /api/articles/1/comments returns comments sorted by date',()=>{
            return request(app).get('/api/articles/1/comments').expect(200).then(({body})=>{
                expect(body.comments).toBeSortedBy('created_at',{descending:true})
            })
        })

        it('200 /api/articles/1/comments hardcoded example returns comments sorted by date',()=>{
            
            return db.query(`DELETE FROM comments WHERE comments.article_id=4`).then(()=>{
                return db.query(`INSERT INTO comments
                    (body,article_id,author,votes)
                    VALUES
                    ('test1',4,'lurker',0),
                    ('test2',4,'lurker',0),
                    ('test3',4,'lurker',0),
                    ('test4',4,'lurker',0)`)
            }).then(()=>{
                return request(app).get('/api/articles/4/comments').expect(200)
            }).then(({body})=>{
               expect(body.comments).toBeSortedBy('created_at',{descending:true})
            })
           
        })

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
                expect(body).toEqual(expect.objectContaining({articles:expect.any(Array)}));
            })
        });

        it('200: /api/articles returns an array of "article" objects',() => {
            return request(app).get('/api/articles').expect(200).then((data)=>{
                data.body.articles.forEach((article)=>{
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

        it('200: /api/articles returns an array of length 10',() => {
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                expect(body.articles.length).toEqual(10);
            })
        });

        it('200: /api/articles returns {articles:[]} when articles table is empty',() => {
            return db.query('DELETE FROM comments').then(()=>{
                return db.query('DELETE FROM articles');
            }).then(() => {
                return request(app).get('/api/articles').expect(200)
            }).then(({body}) => {
                return expect(body).toEqual(expect.objectContaining({total_count:0,articles:[]}));
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

        it('200: GET /api/articles?topic=cats hard coded test',() => {
            return request(app).get('/api/articles?topic=cats').expect(200).then(({body})=>{
                expect(body.articles).toEqual([expect.objectContaining({
                    article_id:5,
                    title:'UNCOVERED: catspiracy to bring down democracy',
                    topic:'cats',
                    author:'rogersop',
                    body:'Bastet walks amongst us, and the cats are taking arms!',
                    created_at:expect.any(String),
                    votes:0,
                    comment_count:2
                })])
            })
        });

        it('200: GET /api/articles?topic=unassignedtopic returns {articles:[]}',() => {
            
            return db.query(`INSERT INTO topics (slug,description)
            VALUES ('unassignedtopic','used for a test')`).then(()=>{
                return request(app).get('/api/articles?topic=unassignedtopic').expect(200)
            }).then(({body})=>{
                expect(body).toEqual(expect.objectContaining({total_count:0,articles:[]}))
            })
        });

        it('200: GET /api/articles? returns array of length 12 - hard coded test',() => {
            return request(app).get('/api/articles?').expect(200).then(({body})=>{
                expect(body.articles.length).toBe(10);
            })
        });
        
        it('400: GET /api/articles?sort_by=NOTACOLUMN returns "Invalid sort_by column" message',() => {
            return request(app).get('/api/articles?sort_by=NOTACOLUMN').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid sort_by column'})
            })
        });

        it('400: GET /api/articles?order=alphabetical returns "Invalid order"',() => {
            return request(app).get('/api/articles?order=alphabetical').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid order'})
            })
        });

        it('404: GET /api/articles?topic=notatopic returns "Non-existent topic"',() => {
            return request(app).get('/api/articles?topic=notatopic').expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent topic'})
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

    describe('DELETE /api/comments/__comment_id',() => {
        it('204: /api/comments/1 returns status 204 on valid DELETE request',() => {
            return request(app).delete('/api/comments/1').expect(204).then(({body})=>{
                expect(body).toEqual({})
            })
        });

        it('204: /api/comments/2 hard coded test',() => {
            return db.query('SELECT * FROM comments WHERE comment_id=2').then(({rows})=>{
                if(rows.length!==1) return Promise.reject('Comment with comment_id=2 does not exist at test setup')
            }).then(()=>{
                return request(app).delete('/api/comments/2')
            }).then(()=>{
                return db.query('SELECT * FROM comments WHERE comment_id=2')
            }).then(({rows})=>{
                expect(rows.length===0).toBe(true);
            })
        });

        it('400: /api/comments/mikescomment returns "Invalid comment_id"',() => {
            return request(app).delete('/api/comments/mikescomment').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid comment_id'})
            })
        });

        it('404: /api/comments/66666 returns "Non-existent comment_id"',() => {
            return request(app).delete('/api/comments/66666').expect(404).then(({body})=>{
                expect(body).toEqual({msg:'Non-existent comment_id'})
            })
        });
    });

    describe('GET /api/articles pagination',()=>{
        it('200: /api/articles/?limit=3 returns 3 article objects',()=>{
            return request(app).get('/api/articles?limit=3').expect(200).then(({body})=>{
                expect(body.articles.length).toBe(3);
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

        it('200: /api/articles limit has a default value of 10 (if not otherwise specified)',()=>{
            return request(app).get('/api/articles').expect(200).then(({body})=>{
                expect(body.articles.length).toBe(10);
            })
        });

        it('200: /api/articles/?limit=6 p has a default value of 0 if not specified in query',()=>{
            return db.query(`INSERT INTO articles 
            (title,topic,author,body,votes)
            VALUES
            ('1','paper','lurker','someTest9j7k',1),
            ('2','paper','lurker','someTest9j7k',2),
            ('3','paper','lurker','someTest9j7k',3),
            ('4','paper','lurker','someTest9j7k',4),
            ('5','paper','lurker','someTest9j7k',5),
            ('6','paper','lurker','someTest9j7k',6)`).then(()=>{
                return request(app).get('/api/articles?limit=2&p=2').expect(200).then(({body})=>{;
                    body.articles.forEach(result=>{
                        expect(result.body).toBe('someTest9j7k')
                    })
                })
            })
            
            
        })

        it('200: /api/articles/?limit=2&p=2 hardcoded test. returns 3 and 4th article to be added',()=>{
            return db.query(`INSERT INTO articles 
            (title,topic,author,body,votes,created_at)
            VALUES
            ('1','paper','lurker','1',1,'2023-06-06 21:11:00'),
            ('2','paper','lurker','2',2,'2023-07-07 21:11:00'),
            ('3','paper','lurker','3',3,'2023-08-08 21:11:00'),
            ('4','paper','lurker','4',4,'2023-09-09 21:11:00'),
            ('5','paper','lurker','5',5,'2023-10-10 21:11:00'),
            ('6','paper','lurker','6',6,'2023-11-11 21:11:00')`).then(()=>{
                return request(app).get('/api/articles?limit=2&p=2').expect(200).then(({body})=>{;
                    expect(body.articles).toEqual(expect.arrayContaining([
                        {author:'lurker',
                        body:'4',
                        title:'4',
                        article_id:expect.any(Number),
                        topic:'paper',
                        created_at:expect.any(String),
                        votes:4,
                        comment_count:expect.any(Number)},
                        {author:'lurker',
                        body:'3',
                        title:'3',
                        article_id:expect.any(Number),
                        topic:'paper',
                        created_at:expect.any(String),
                        votes:3,
                        comment_count:expect.any(Number)},
                    ]))
                })
            })
            
            
        })

        it('200: /api/articles/?limit=3 hardcoded test. returns a key of total_count and value of total number of articles - ignoring the limit',()=>{
            let totalRows
            
            return db.query('SELECT * FROM articles').then(({rowCount})=>{
                totalRows=rowCount;
            }).then(()=>{
                return request(app).get('/api/articles/?limit=3').expect(200)
            }).then(({body})=>{
                expect(body).toEqual(expect.objectContaining({total_count:totalRows}))
            }) 
        })

        it('200: /api/articles/?limit=2&p=3 hardcoded test. returns a key of total_count and value of total number of articles - ignoring the limit and p(offset)',()=>{
            let totalRows
            
            return db.query('SELECT * FROM articles').then(({rowCount})=>{
                totalRows=rowCount;
            }).then(()=>{
                return request(app).get('/api/articles/?limit=2&p=3').expect(200)
            }).then(({body})=>{
                expect(body).toEqual(expect.objectContaining({total_count:totalRows}))
            }) 
        })

        it('200: /api/articles/?limit=2&p=99 returns {articles:[]}',()=>{
            return request(app).get('/api/articles?limit=2&p=99').expect(200).then(({body})=>{
                expect(body).toEqual(expect.objectContaining({articles:[]}));
            }) 
        })

        it('400: /api/articles/?limit=-4 returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/articles/?limit=-4').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid limit query'})
            })
        })

        it('400: /api/articles/?limit=cat returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/articles/?limit=cat').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid limit query'})
            })
        })

        it('400: /api/articles/?limit=5&p=dog returns {msg: Invalid page query}',()=>{
            return request(app).get('/api/articles/?limit=5&p=dog').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid page query'})
            })
        })

        it('400: /api/articles/?limit=5&p=-2 returns {msg: Invalid page query}',()=>{
            return request(app).get('/api/articles/?limit=5&p=-2').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid page query'})
            })
        })
    });

    describe('GET /api/topics/:slug',()=>{
        it('200: /api/topics/cats returns an object on a key of topic',()=>{
            return request(app).get('/api/topics/cats').expect(200).then(({body})=>{
                expect(body).toEqual({topic: expect.objectContaining({
                    slug: 'cats',
                    description:expect.any(String)
                })})
            })
        })

        it('404: /api/topics/DOESNTEXIST returns {msg: No topic exists with specified slug}',()=>{
            return request(app).get('/api/topics/DOESNTEXIST').then(res => {
                expect(res.status).toBe(404);
                expect(res.body).toEqual({msg:'No topic exists with specified slug'})
            })
        })

        it("404 /api/topics/'; sanitised to protect against SQL injection",()=>{
            return request(app).get("/api/topics/';").then(res =>{
                expect(res.status).toBe(404);
                expect(res.body).toEqual({msg:'No topic exists with specified slug'})
            })
        })
    })

    describe('GET /api/articles/:article_id/comments pagination',()=>{
        it('200: /api/articles/1/comments?limit=5 returns array of 5 results',()=>{
            return request(app).get('/api/articles/1/comments?limit=5').expect(200).then(res=>{
                expect(res.body.comments.length).toBe(5);
            })
        })

        it('200: /api/articles/1/comments returns array of 10 results by default',()=>{
            return db.query('SELECT * FROM comments WHERE comments.article_id=1').then(({rows})=>{
                expect(rows.length>10).toBe(true);
            }).then(()=>{
                return request(app).get('/api/articles/1/comments').expect(200)
            }).then(res=>{
                expect(res.body.comments.length).toBe(10);
            }) 
        })

        it('200: /api/articles/1/comments?limit=5&p=2 hardcoded test returns second 5 results',()=>{
            return db.query(`DELETE FROM comments WHERE comments.article_id=4`).then(()=>{
                return db.query(`INSERT INTO comments
                    (body,article_id,author,votes)
                    VALUES
                    ('test1',4,'lurker',0),
                    ('test2',4,'lurker',0),
                    ('test3',4,'lurker',0),
                    ('test4',4,'lurker',0),
                    ('test5',4,'lurker',0),
                    ('test6',4,'lurker',0),
                    ('test7',4,'lurker',0),
                    ('test8',4,'lurker',0),
                    ('test9',4,'lurker',0),
                    ('test10',4,'lurker',0),
                    ('test11',4,'lurker',0),
                    ('test12',4,'lurker',0)
                    `)
            }).then(()=>{
                return request(app).get('/api/articles/4/comments?limit=5&p=2').expect(200)
            }).then(({body})=>{
                
              for(let i=0;i<=4;i++){
                let testStr='test' + (i+6)

                expect(body.comments[i].body).toBe(testStr);
              }
            })
        })

        it('200: /api/articles/1/comments?limit=5 hardcoded test - p is 1 by default',()=>{
            return db.query(`DELETE FROM comments WHERE comments.article_id=4`).then(()=>{
                return db.query(`INSERT INTO comments
                    (body,article_id,author,votes)
                    VALUES
                    ('test1',4,'lurker',0),
                    ('test2',4,'lurker',0),
                    ('test3',4,'lurker',0),
                    ('test4',4,'lurker',0),
                    ('test5',4,'lurker',0),
                    ('test6',4,'lurker',0),
                    ('test7',4,'lurker',0),
                    ('test8',4,'lurker',0),
                    ('test9',4,'lurker',0),
                    ('test10',4,'lurker',0)
                    `)
            }).then(()=>{
                return request(app).get('/api/articles/4/comments?limit=5').expect(200)
            }).then(({body})=>{
                
              for(let i=0;i<=4;i++){
                let testStr='test' + (i+1)

                expect(body.comments[i].body).toBe(testStr);
              }
            })
        })

        it('200: /api/articles/1/comments?limit=5 maintains sort by date with limit query applied',()=>{
            return request(app).get('/api/articles/1/comments?limit=5').expect(200).then(({body})=>{
                expect(body.comments).toBeSortedBy('created_at',{descending:true})
            })
        })

        it('200: /api/articles/1/comments?limit=5&p=2 maintains sort by date with limit & page queries applied',()=>{
            return request(app).get('/api/articles/1/comments?limit=5&p=2').expect(200).then(({body})=>{
                expect(body.comments).toBeSortedBy('created_at',{descending:true})
            })
        })

        it('400: /api/articles/1/comments?limit=5&p=three returns {msg: Invalid page query}',()=>{
            return request(app).get('/api/articles/1/comments?limit=5&p=three').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid page query'})
            })
        })

        it('400: /api/articles/1/comments?limit=5&p=-1 returns {msg: Invalid page query}',()=>{
            return request(app).get('/api/articles/1/comments?limit=5&p=-1').expect(400).then(({body})=>{
                expect(body).toEqual({msg: 'Invalid page query'})
            })
        })

        it('400: /api/articles/1/comments?limit=five returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/articles/1/comments?limit=five').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid limit query'})
            })
        })

        it('400: /api/articles/1/comments?limit=-6 returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/articles/1/comments?limit=-6').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid limit query'})
            })
        })
    })

    describe('GET /api/topics pagination',()=>{

        it('200 /api/topics limit is 10 rows by default',()=>{
            return db.query(`INSERT INTO topics
            (slug,description)
            VALUES
            ('4','4'),
            ('5','5'),
            ('6','6'),
            ('7','7'),
            ('8','8'),
            ('9','9'),
            ('10','10'),
            ('11','11'),
            ('12','12')
            `).then(()=>{
               return request(app).get('/api/topics').expect(200)
            }).then(({body})=>{
                expect(body.topics.length).toBe(10);
            });
        })

        it('200 /api/topics?limit=7 returns 7 rows',()=>{
            return request(app).get('/api/topics?limit=7').expect(200).then(({body})=>{
                expect(body.topics.length).toBe(7);
            });
        })

        it('200 /api/topics?limit=3 hardcoded - default p is 1',()=>{
            return db.query(`DELETE FROM comments`).then(()=>{
                return db.query(`DELETE FROM articles`)
            }).then(()=>{
                return db.query(`DELETE FROM topics`)
            }).then(()=>{
                return db.query(`INSERT INTO topics
                (slug,description)
                VALUES
                ('4','4'),
                ('5','5'),
                ('6','6'),
                ('7','7'),
                ('8','8'),
                ('9','9'),
                ('10','10'),
                ('11','11'),
                ('12','12')`)
            }).then(()=>{
                return request(app).get('/api/topics?limit=3').expect(200)
            }).then(({body})=>{
                expect(body).toEqual({topics:[
                    {slug:'4',description:'4'},{slug:'5',description:'5'},{slug:'6',description:'6'}]
                })
            })
            //keep hardcoded test below this one
        })

        it('200 /api/topics?limit=3&p=2 hardcoded - returns 4th,5th and 6th topics to be added to table',()=>{
           //this test should proceed commented test
            return request(app).get('/api/topics?limit=3&p=2').expect(200).then(({body})=>{
                expect(body).toEqual({topics:[
                    {slug:'7',description:'7'},{slug:'8',description:'8'},{slug:'9',description:'9'}]
                })
            })    
        })

        it('200 /api/topics?limit=7&p=2000 returns {topics:[]}',()=>{
            return request(app).get('/api/topics?limit=7&p=2000').expect(200).then(({body})=>{
                expect(body).toEqual({topics:[]})
            });
        })

        it('400 /api/topics?limit=duck returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/topics?limit=duck').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid limit query'})
            })
        })

        it('400 /api/topics?limit=eight returns {msg: Invalid limit query}',()=>{
            return request(app).get('/api/topics?limit=eight').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid limit query'})
            })
        })

        it('400 /api/topics?p=tiger returns {mgs: Invalid page query}',()=>{
            return request(app).get('/api/topics?p=tiger').expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid page query'})
            });
        })

        it('400 /api/topics?p=-4 returns {mgs: Invalid page query}',()=>{
            return request(app).get('/api/topics?p=-4').expect(400).then(({body})=>{
              expect(body).toEqual({msg:'Invalid page query'})
            }).then(()=>{
                return seed(testData)
            })
        })
    })

    describe('PATCH /api/comments/:comment_id',()=>{

        it('200 /api/comments/1 hardcoded - increase by 1 vote',()=>{
            let beforePatch;
            let afterPatch;
            return db.query(`SELECT * FROM comments WHERE comment_id=1`).then(({rows})=>{
                beforePatch=rows[0].votes;
            }).then(()=>{
                return request(app).patch('/api/comments/1').send({inc_votes:1})
            }).then(()=>{
                return db.query(`SELECT * FROM comments WHERE comment_id=1`)
            }).then(({rows})=>{
                afterPatch=rows[0].votes;
                expect(afterPatch).toBe(beforePatch+1);
            })
        })

        it('200 /api/comments/3 hardcoded - decrease by 3 vote',()=>{
            let beforePatch;
            let afterPatch;
            return db.query(`SELECT * FROM comments WHERE comment_id=3`).then(({rows})=>{
                beforePatch=rows[0].votes;
            }).then(()=>{
                return request(app).patch('/api/comments/3').send({inc_votes:-3})
            }).then(()=>{
                return db.query(`SELECT * FROM comments WHERE comment_id=3`)
            }).then(({rows})=>{
                afterPatch=rows[0].votes;
                expect(afterPatch).toBe(beforePatch-3);
            })
        })

        it('200 /api/comments/1 hardcoded -returns the updated comment on a key of comment',()=>{
            let beforePatch;
            return db.query(`SELECT * FROM comments WHERE comment_id=1`).then(({rows})=>{
                beforePatch=rows[0]
            }).then(()=>{
                return request(app).patch('/api/comments/1').send({inc_votes:1})
            }).then(({body})=>{
                console.log(body)
                expect(body).toEqual(expect.objectContaining(
                    {comment: {article_id: beforePatch.article_id,
                    author:beforePatch.author,
                    body:beforePatch.body,
                    comment_id:beforePatch.comment_id,
                    created_at:expect.any(String),
                    votes:beforePatch.votes+1}}))
            })
        })
        
        it('400 /api/comments/thirty invalid comment_id returns {msg: Invalid comment_id}',()=>{
            return request(app).patch('/api/comments/thirty').send({inc_votes:1}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid comment_id'})
            })
        })

        it('400 /api/comments/1  invalid PATCH body {inc_votes:ten} returns {msg: Invalid PATCH body}',()=>{
            return request(app).patch('/api/comments/1').send({inc_votes:'ten'}).expect(400).then(({body})=>{
                expect(body).toEqual({msg:'Invalid PATCH body'})
            })
        })

        it('404 /api/comments/66666 non-existent comment_id returns 404',()=>{
            return request(app).patch('/api/comments/66666').send({inc_votes:1}).expect(404)
        });
    })
});

