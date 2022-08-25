const commentsRouter = require('express').Router();

const { patchCommentById, deleteCommentByCommentId } = require('../controllers/comments.controllers')

commentsRouter.route('/:comment_id')
    .patch(patchCommentById)
    .delete(deleteCommentByCommentId);

module.exports = { commentsRouter }