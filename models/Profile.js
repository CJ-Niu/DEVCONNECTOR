const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({

    // create reference to user model
    user: {
        type: mongoose.Schema.Types.ObjectId,       
        ref: 'user'                                 // add reference
    },

    // different fields in user profile
    company: {
        type: String
      },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],                             // array of String
        required: true
    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },

    experience: [                                   // experience fields & info - (Array)
        {
            title: {
                type: String,
                required: true
            },
            company: {
                type: String,
                required: true
            },
            location: {
                type: String
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String
            }
        }
    ],

    education: [                                    // education fields & info - (Array)
        {
            school: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String
            }
        }
    ],

    social: {                                       // social media fields & info - (Object)
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        }
    },

    date: {                                         // date fields
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);