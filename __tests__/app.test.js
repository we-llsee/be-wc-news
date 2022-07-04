const app= require('../app.js');
const request=require('supertest')

describe('Express app',() => {
   describe('/api/topics',() => {
    it('200: GET /api/topics',() => {
       return request(app).get('/api/topics').expect(200);
    });
   });
});