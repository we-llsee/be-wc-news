const app= require('../app.js');
const request=require('supertest')
const db= require('../db/connection.js')

beforeAll(()=>{
    const testData=require('../db/data/test-data/index.js');
    const seed=require('../db/seeds/seed');
    return seed(testData);
});

afterAll(()=>{
    return db.end()
});

describe('Express app',() => {
   describe('/api/topics',() => {
    it('200: GET /api/topics',() => {
       return request(app).get('/api/topics').expect(200);
    });
    it('GET /api/topics returns an array',() => {
        return request(app).get('/api/topics').expect(200).then(({body}) =>{
            expect(Array.isArray(body)).toBe(true);
            expect(body.length > 0).toBe(true);
        })
    });
   
    it('GET /api/topics returns topic objects',() => {
        return request(app).get('/api/topics').expect(200).then(({body}) =>{
            body.forEach(topic=>{
                expect(topic).toEqual(expect.objectContaining({
                    description:expect.any(String),
                    slug:expect.any(String),
                }));
            });
        });
    });
   });
});