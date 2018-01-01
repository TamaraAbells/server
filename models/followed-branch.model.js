const reqlib = require('app-root-path').require;

const aws = reqlib('config/aws');
const db = reqlib('config/database');
const Model = reqlib('models/model');
const validate = reqlib('models/validate');

class FollowedBranch extends Model {
  constructor(props) {
    super(props, {
      keys: db.Keys.FollowedBranches,
      schema: db.Schema.FollowedBranch,
      table: db.Table.FollowedBranches,
    });
  }

  // Get a FollowedBranch by its id from the db, and
  // instantiate the object with this data.
  // Rejects promise with true if database error, with false if no user found.
  findByUsername(username) {
    return new Promise((resolve, reject) => {
      aws.dbClient.query({
        ExpressionAttributeValues: {
          ':username': username,
        },
        KeyConditionExpression: 'username = :username',
        TableName: this.config.table,
      }, (err, data) => {
        if (err) {
          return reject(err);
        }

        if (!data || !data.Items) {
          return reject();
        }

        return resolve(data.Items);
      });
    });
  }

  // Validate the properties specified in 'properties' on the FollowedBranch object,
  // returning an array of any invalid ones
  validate(props) {
    let invalids = [];

    // ensure username is valid username
    if (props.includes('username')) {
      if (!validate.username(this.data.username)) {
        invalids = [
          ...invalids,
          'username',
        ];
      }
    }

    // ensure branchid exists and is of correct length
    if (props.includes('branchid')) {
      if (!validate.branchid(this.data.branchid)) {
        invalids = [
          ...invalids,
          'branchid',
        ];
      }
    }

    return invalids;
  }
}

module.exports = FollowedBranch;
