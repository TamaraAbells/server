const express = require('express');
const reqlib = require('app-root-path').require;

const ACL = reqlib('config/acl');
const router = express.Router();

module.exports = () => {
  const controller = require('./controller');

  router.route('/:postid/answer')
    /**
     * @api {poll} /:postid/answer Create an answer for a poll
     * @apiName Create Poll Answer
     * @apiGroup Polls
     * @apiPermission auth
     * @apiVersion 1.0.0
     *
     * @apiParam (URL Parameters) {String} postid Id of the post (of type=poll) that the Answer belongs to
     * @apiParam (Body Parameters) {String} text The textual description of the Answer
     *
     * @apiUse OK
     * @apiUse NotFound
     * @apiUse BadRequest
     * @apiUse InternalServerError
     */
    .post(ACL.allow(ACL.Roles.User), controller.addAnswer)
    /**
     * @api {poll} /:postid/answer Get the answers for a particular poll
     * @apiName Get Poll Answers
     * @apiGroup Polls
     * @apiPermission guest
     * @apiVersion 1.0.0
     *
     * @apiParam (URL Parameters) {String} postid The unique id of the post
     * @apiParam (Query Parameters) {String} sortBy Whether to sort the results by 'votes' or 'date'
     *
     * @apiUse OK
     * @apiUse NotFound
     * @apiUse BadRequest
     * @apiUse InternalServerError
     */
    .get(ACL.allow(ACL.Roles.Guest), controller.getAnswers);

  router.route('/:postid/answer/:answerid/vote')
    /**
     * @api {put} /poll/:postid/vote Vote Poll Answer
     * @apiName Vote Poll Answer
     * @apiGroup Polls
     * @apiPermission auth
     * @apiVersion 1.0.0
     *
     * @apiParam (URL Parameters) {String} postid The unique id of the post.
     * @apiParam (URL Parameters) {String} postid The unique id of the poll answer.
     * @apiParam (Body Parameters) {String} vote Vote direction ['up', 'down']
     *
     * @apiUse OK
     * @apiUse BadRequest
     * @apiUse NotFound
     * @apiUse InternalServerError
     */
    .put(ACL.allow(ACL.Roles.User), controller.vote);

  return router;
};
