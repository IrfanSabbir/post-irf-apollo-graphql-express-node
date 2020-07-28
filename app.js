const http = require('http')
const express = require('express')
const path = require('path')
const {ApolloServer , PubSub } = require('apollo-server-express')
const {fileLoader ,mergeResolvers, mergeTypes} = require('merge-graphql-schemas')
const mongoose = require('mongoose')
const cors = require('cors');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');
const {restAuthCheck} = require('./helpers/auth')



require('dotenv').config()

const app = express()

const pubsub = new PubSub()

const db = async ()=>{
    try {
        const success = await mongoose.connect(process.env.DATABSE,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log("Mongoose is connected" )
    } catch (error) {
        console.log("mongoose: "+ error)
    }
}

db()

app.use(cors());
app.use(bodyParser.urlencoded({extended:true, limit: '50mb'}))
app.use(bodyParser.json({limit: '50mb'}))

const typeDefs = mergeTypes(fileLoader(path.join(__dirname,'./typeDefs')))
const resolvers = mergeResolvers(fileLoader(path.join(__dirname,'./resolvers')))

const apolloServer =new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res , pubsub})
})

apolloServer.applyMiddleware({app})

const httpServer = http.createServer(app)
apolloServer.installSubscriptionHandlers(httpServer)

cloudinary.config ({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_AOU_SECRET
})


const User = require('./model/user')
app.post('/uploadImages', restAuthCheck,  (req, res, next)=>{
    // console.log(req.body.image)

    cloudinary.uploader.upload(
        req.body.image,
        (result)=>{
            const clud_res = result
            User.findByIdAndUpdate({_id:req.id},
                {
                    $push :{
                        images:{
                             url:clud_res.secure_url,
                             public_id:clud_res.public_id
                        }
                    }
                })
                .then (updated=>{
                    res.send({
                        url:clud_res.secure_url,
                        public_id:clud_res.public_id
                    })
                })
                .catch(error=>{
                    res.send(error)
                })
            // res.send({
            //     url:result.secure_url,
            //     public_id:result.public_id
            // })
        },
        {
            public_id:`${Date.now()}` ,
            resource_type: 'auto'
        }
    )
})

app.post('/post_image', restAuthCheck,  (req, res, next)=>{
    
    cloudinary.uploader.upload(
        req.body.image,
        (result)=>{
               
            res.send({
                url:result.secure_url,
                public_id:result.public_id
            })
        },
        {
            public_id:`${Date.now()}` ,
            resource_type: 'auto'
        }
    )
})

app.post('/removeimage', restAuthCheck, async (req, res) => {
    let image_id = req.body.public_id;
    console.log(image_id)
    try{
        const update = await User.updateOne({_id:req.id} ,{
            $pull :{images : {public_id:image_id} }
        })
        console.log(update)
    }catch(error){
        return res.json({ success: false, error });
    }
    
    cloudinary.uploader.destroy(image_id, (error, result) => {
        if (error) return res.json({ success: false, error });
        res.send('ok');
    });
});


httpServer.listen(process.env.PORT, ()=>{
    console.log("listning to port")
})