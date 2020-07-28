const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        user_name: {
            type: String,
            required: true,
        },
        password:{
            type:String,
            required:true
        },
        name: {
            type: String,
            default:null
        },
        email: {
            type: String,
            required: true,
        },
        images: [{
            url:{
                type:String,
                default:null
            },
            public_id:{
                type:String,
                default:null
            }
        }],
        about: {
            type: String,
            default:null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
