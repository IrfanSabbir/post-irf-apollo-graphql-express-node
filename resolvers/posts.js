const Post = require('../model/post')
const User = require('../model/user')
const dateFormat = require('date-format')
const cloudinary = require('cloudinary');
const { authCheck} = require('../helpers/auth')

cloudinary.config ({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_AOU_SECRET
})


const POST_ADDED = 'POST_ADDED'; 
const POST_UPDATED = 'POST_UPDATED'; 
const POST_DELETED = 'POST_DELETED'; 


const allPosts = async (parent ,args)=>{
    try {
        const search = args.search || ''
        const page = args.page || 1
        const limit =  3
        let post =[]
        if(!search){

            post = await Post.find()
                            .skip((page-1)*limit)
                            .limit(limit)
                            .sort({_id:-1})
        }
        else{
            post = await Post.find({
                                $or:[
                                    {content :{$regex:search , $options : 'i'}},
                                    {craeted_at :{$regex:search , $options : 'i'}},
                                    {creator :{$regex:search , $options : 'i'}},

                                ]
                            })
                            .skip((page-1)*limit)
                            .limit(limit)
                            .sort({_id:-1})
        }
        return post
    } catch (error) {
        throw error
    }
}

const userPost = async (_, {user_name})=>{
    try {
        const post = await Post.find({creator:user_name}).sort({_id:-1})
        return post
    } catch (error) {
        throw error
    }
}

const newPost = async ()=>{
    try {
        let date = dateFormat(new Date(), "yyyy-mm-dd").substr(0,10)
       // const date = dateFormat(new Date() ,'yyyy-mm-dd')//
        console.log(date)
        const post = await Post.find({craeted_at:{$regex:date }}).sort({_id:-1})
        return post
    } catch (error) {
        throw error
    }
}

const authUserPost = async (parent , args , {req})=>{
    try {
        const _id = await authCheck(req)
        const post = await Post.find({created_by:_id}).sort({_id:-1})
        return post
    } catch (error) {
        throw error
    }
}

const createPost = async (parent,{input},{req , pubsub})=>{ 
    try {
        const _id = await authCheck(req)
        const user = await User.findOne({_id:_id}).select('user_name')
        let image = {
            url:"",
            public_id:""
        }

        if(input.image.url){
            image = {
                url:input.image.url,
                public_id:input.image.public_id
            }

        }
        const craeted_at = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        const newPost = new Post({
            content:input.content,
            image:image,
            created_by: _id,
            creator:user.user_name,
            craeted_at,
        })
        await newPost.save()
        pubsub.publish(POST_ADDED , { postAdded: newPost})
        return newPost
    } catch (error) {
        throw error
    }
}

const deletePost = async (_ , {post_id}, {req , pubsub})=>{
    try {
        const _id = await authCheck(req)
        await Post.deleteOne({_id:post_id, created_by:_id})
        pubsub.publish(POST_DELETED  ,{
            postDeleted:post_id
        })
        return {post_id:post_id}
    } catch (error) {
        throw error
    }
}

const updatePost = async (_ ,{input} , {req, pubsub})=>{
    try {
        const user_id = await authCheck(req)
        const _id = input._id
        const image = input.fields.image
        const post = await Post.findOne({_id :_id})
        post.content = input.fields.content || post.content 
   
        if(image){
            const previous_public_id = post.image ? post.image.public_id : null
             cloudinary.uploader.destroy(previous_public_id , (err , result)=>{
                 console.log(err)
            })
            post.image = image
        }

        await post.save()
        pubsub.publish(POST_UPDATED  ,{
            postUpdated:post
        })
        return post
        
    } catch (error) {
        throw error
    }
}

const countPost  = async ()=>{
    try {
        const count = await Post.find().countDocuments()
        return count
    } catch (error) {
        throw error
    }
}
module.exports = {
    Query:{
        allPosts,
        userPost,
        newPost,
        authUserPost,
        countPost
    },
    Mutation:{
        createPost,
        deletePost,
        updatePost
    },
    Subscription:{
        postAdded : {
            subscribe : (_, args , {pubsub})=>pubsub.asyncIterator([POST_ADDED]) 
        },
        postUpdated : {
            subscribe : (_, args , {pubsub})=>pubsub.asyncIterator([POST_UPDATED]) 
        },
        postDeleted : {
            subscribe : (_, args , {pubsub})=>pubsub.asyncIterator([POST_DELETED]) 
        }
    }

}