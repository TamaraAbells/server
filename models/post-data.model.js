const reqlib = require('app-root-path').require;

const aws = reqlib('config/aws');
const Constants = reqlib('config/constants');
const db = reqlib('config/database');
const Model = reqlib('models/model');
const validate = reqlib('models/validate');

class PostData extends Model {
  constructor(props) {
    super(props, {
      keys: db.Keys.PostData,
      schema: db.Schema.PostData,
      table: db.Table.PostData,
    });
  }

  // Get a post' data by its id from the db, and
  // instantiate the object with this data.
  // Rejects promise with true if database error, with false if no post found.
  findById(id) {
    return new Promise( (resolve, reject) => {
      aws.dbClient.get({
        Key: { id },
        TableName: this.config.table,
      }, (err, data) => {
        if (err) {
          return reject(err);
        }

        if (!data || !data.Item) {
          return reject();
        }

        this.data = data.Item;
        return resolve(this.data);
      });
    });
  }

  // Validate the properties specified in 'properties' on the PostData object,
  // returning an array of any invalid ones
  validate(props, postType) {
    if (!Array.isArray(props) || !props.length) {
      props = [
        'id',
        'creator',
        'title',
        'text',
        'original_branches',
      ];
    }

    let invalids = [];

    if (props.includes('id')) {
      if (!validate.postid(this.data.id)) {
        invalids = [
          ...invalids,
          'id',
        ];
      }
    }

    if (props.includes('creator')) {
      if (!validate.username(this.data.creator)) {
        invalids = [
          ...invalids,
          'creator',
        ];
      }
    }

    if (props.includes('title')) {
      const { postTitle } = Constants.EntityLimits;
      if (!this.data.title ||
        this.data.title.length < 1 ||
        this.data.title.length > postTitle) {
        invalids = [
          ...invalids,
          'title',
        ];
      }
    }

    const text = this.data.text;
    if (props.includes('text')) {
      const { postText } = Constants.EntityLimits;
      if ((!['poll', 'text'].includes(postType) &&
        (!text || text.length < 1)) || (text && text.length > postText)) {
        invalids = [
          ...invalids,
          'text',
        ];
      }
    }

    // Must be valid JSON array.
    if (props.includes('original_branches')) {
      if (!this.data.original_branches || !this.data.original_branches.length) {
        invalids = [
          ...invalids,
          'original_branches',
        ];
      }
      else {
        try {
          JSON.parse(this.data.original_branches);
        }
        catch (err) {
          invalids = [
            ...invalids,
            'original_branches',
          ];
        }
      }
    }

    return invalids;
  }
}

module.exports = PostData;
