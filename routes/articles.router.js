const articlesRouter = require('express').Router();

const { getArticleById, getArticles, patchArticleById } = require('../controllers/articles.controllers')
const { getCommentsByArticleId, postCommentByArticleId } = require('../controllers/comments.controllers')

articlesRouter.get('/',getArticles);

articlesRouter.route('/:article_id')
    .get(getArticleById)
    .patch(patchArticleById);

articlesRouter.route('/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId);

module.exports = { articlesRouter }