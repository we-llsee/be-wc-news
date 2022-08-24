const commentsRouter = require('express').Router();

const { patchCommentById, deleteCommentByCommentId } = require('../controllers/comments.controllers')

commentsRouter.patch('/:comment_id',patchCommentById);
commentsRouter.delete('/:comment_id',deleteCommentByCommentId)

module.exports = { commentsRouter }