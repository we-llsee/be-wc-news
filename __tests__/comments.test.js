const request = require('supertest')

const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data/index.js');

const commentsTests=()=>{

    beforeEach(()=>{
        return seed(testData)
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
}

module.exports = { commentsTests }