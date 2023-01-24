const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({             // all the info a post should contain

    user: {                                 // user id --> post
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {                                 // name of the USER, not post
        type: String
    },
    avatar: {
        type: String
    },
    likes: [                                // array of likes
        {
            user: {                                 // user --> each like
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [                             // array of comments
        {
            user: {                                 // user --> each comment
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {                                 // text of each comment
                type: String,
                required: true
            },
            name: {                                 // name of the USER, not post
                type: String
            },
            avatar: {
                type: String
            },
            date: {                                 // time of the comment
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {                                 // time of the post
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);