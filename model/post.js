const mongoose = require('mongoose')

const Schema =  mongoose.Schema

const postSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    image : {
            url:{type:String, default:null},
            public_id:{type:String, default:null}
    },
    created_by:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    creator:{
        type:String,
        required:true
    },
    craeted_at:{
        type:String,
    },
    updated_at:{
        type:String,
    },
    view:{
        type:Number,
        default:0
    },
    like:{
        type:Number,
        default:0
    },
    // comments:{
    //     type:
    // }
})


module.exports = mongoose.model('Post',postSchema)
