'use strict';

var aws = require('../config/aws.js');
var fs = require('../config/filestorage.js');

var Branch = require('../models/branch.model.js');
var BranchImage = require('../models/branch-image.model.js');
var success = require('./responses/successes.js');
var error = require('./responses/errors.js');

module.exports = {
  postBranch: function(req, res) {
    if(!req.user.username) {
      console.error("No username found in session.");
      return error.Forbidden(res);
    }

    var branch = new Branch({
      id: req.body.id,
      name: req.body.name,
      mods: [req.user.username],
      creator: req.user.username,
      date: new Date().getTime(),
      parentid: req.body.parentid
    });

    // validate branch properties
    var propertiesToCheck = ['id', 'name', 'mods', 'creator', 'date', 'parentid'];
    var invalids = branch.validate(propertiesToCheck);
    if(invalids.length > 0) {
      return error.BadRequest(res, 'Invalid ' + invalids[0]);
    }

    branch.save().then(function() {
      return success.OK(res);
    }, function() {
      return error.InternalServerError(res);
    });
  },
  getBranch: function(req, res) {
    if(!req.params.branchid) {
      return error.BadRequest(res, 'Missing branchid');
    }

    var branch = new Branch();
    branch.findById(req.params.branchid).then(function() {
      return success.OK(res, branch.data);
    }, function(err) {
      if(err) {
        return error.InternalServerError(res);
      }
      return error.NotFound(res);
    });
  },
  putBranch: function(req, res) {
    if(!req.params.branchid) {
      return error.BadRequest(res, 'Missing branchid');
    }

    var branch = new Branch({
      id: req.params.branchid
    });

    var propertiesToCheck = [];
    if(req.body.name) {
      branch.set('name', req.body.name);
      propertiesToCheck.push('name');
    }

    // Check new parameters are valid, ignoring id validity
    var invalids = branch.validate(propertiesToCheck);

    if(invalids.length > 0) {
      return error.BadRequest(res, 'Invalid ' + invalids[0]);
    }
    branch.update().then(function() {
      return success.OK(res);
    }, function() {
      return error.InternalServerError(res);
    });
  },
  getPictureUploadUrl: function(req, res, type) {
    if(!req.user || !req.user.username) {
      return error.Forbidden(res);
    }

    if(!req.params.branchid) {
      return error.BadRequest(res, 'Missing branchid');
    }

    if(type != 'picture' && type != 'cover') {
      return error.InternalServerError(res);
    }

    var filename = req.params.branchid + '-' + type + '-orig.jpg';
    var params = {
      Bucket: fs.Bucket.BranchImages,
      Key: filename,
      ContentType: 'image/*'
    }
    var url = aws.s3Client.getSignedUrl('putObject', params, function(err, url) {
      return success.OK(res, url);
    });
  },
  getPicture: function(req, res, type) {
    if(!req.params.branchid) {
      return error.BadRequest(res, 'Missing branchid');
    }

    if(type != 'picture' && type != 'cover') {
      return error.InternalServerError(res);
    }
    var size;
    if(type == 'picture') {
      size = 500;
    } else {
      size = 1280;
    }

    var image = new BranchImage();
    image.findById(req.params.branchid, type).then(function() {
      aws.s3Client.getSignedUrl('getObject', {
        Bucket: fs.Bucket.BranchImagesResized,
        Key: image.data.id + '-' + size + '.' + image.data.extension
      }, function(err, url) {
        if(err) {
          return error.InternalServerError(res);
        }
        return success.OK(res, url);
      });
    }, function(err) {
      if(err) {
        return error.InternalServerError(res);
      }
      return error.NotFound(res);
    });
  },
  getSubbranches: function(req, res) {
    if(!req.params.parentid) {
      return error.BadRequest(res, 'Missing parentid');
    }

    var branch = new Branch();
    branch.findSubbranches(req.params.parentid).then(function(data) {
      return success.OK(res, data);
    }, function() {
      return error.InternalServerError(res);
    });
  }
};
