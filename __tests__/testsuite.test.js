const db = require('../db/connection.js')
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed');
const { usersTests } = require('./users.test')
const { topicsTests } = require('./topics.test')
const { commentsTests } = require('./comments.test')
const { articlesTests } = require('./articles.test')

beforeAll(()=>{
    return seed(testData);
});

afterAll(()=>{
    return db.end()
});

describe('/api/users',usersTests)
describe('/api/topics',topicsTests)
describe('/api/comments',commentsTests)
describe('/api/articles',articlesTests)