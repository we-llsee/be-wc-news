const topicsRouter = require('express').Router();

const { getTopics, getTopicBySlug } = require('../controllers/topics.controllers')

topicsRouter.get('/',getTopics);
topicsRouter.get('/:slug',getTopicBySlug)

module.exports = { topicsRouter }