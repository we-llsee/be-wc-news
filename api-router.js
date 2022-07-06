const controllers=require('./controllers/controllers')
const apiRouter= require('express').Router();

apiRouter.get('/api/topics',controllers.getTopics);

apiRouter.get('/api/articles/:article_id',controllers.getArticleById);

apiRouter.patch('/api/articles/:article_id',controllers.patchArticleById);

module.exports = apiRouter;