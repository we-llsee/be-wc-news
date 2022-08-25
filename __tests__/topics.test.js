const request = require('supertest')

const app = require('../app.js');
const db = require('../db/connection.js')
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed');

const topicsTests=()=>{
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
}

module.exports = { topicsTests }