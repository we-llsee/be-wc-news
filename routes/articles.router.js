const articlesRouter = require('express').Router();
const { getArticleById, getArticles, patchArticleById } = require('../controllers/articles.controllers')

articlesRouter.get('/',getArticles);

articlesRouter.get('/:article_id',getArticleById);

articlesRouter.patch('/:article_id',patchArticleById);

module.exports = { articlesRouter }