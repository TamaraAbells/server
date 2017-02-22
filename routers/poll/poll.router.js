'use strict';

var express = require('express');
var router = express.Router();
var ACL = require('../../config/acl.js');

var success = require('../../responses/successes.js');
var error = require('../../responses/errors.js');

module.exports = function(app, passport) {
  var controller = require('./poll.controller.js');

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
    .post(ACL.validateRole(ACL.Roles.AuthenticatedUser), controller.post)
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
    .get(controller.get);

  return router;
}
