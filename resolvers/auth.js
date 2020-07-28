const User = require('../model/user')
const jwt = require('jsonwebtoken')
const {authCheck} =require('../helpers/auth')
const me = ()=> 'Irfan'


const userCreate = async (parent, args)=>{
    try {
        
        const email = args.input.email
        const username = args.input.user_name
        console.log(email)
        const user = await User.findOne({email:email})
        if(user){
            throw new Error("User already exist")
        }
        console.log("continue")
        const newUser = new User({
            name:args.input.name,
            email:email,
            user_name:username,
            password:args.input.password,
            about:args.input.about
        })
        const saveUser = await newUser.save()
        saveUser.password = null
        
        const token = jwt.sign(
            {
                id:saveUser._id,
                user_name:saveUser.user_name,
                email:saveUser.email
            },
            process.env.JWT_SECRET_KEY
        )

        return {token:token, user:saveUser}
    } catch (error) {
        throw error
    }
}

const userLogIn = async (parent, args)=>{
    try {
        
        const email = args.input.email
        const password = args.input.password
        
        const user = await User.findOne({email:email})
        if(!user){
            throw new Error("Invalid Email, doesn't exist")
        }
       
       if(user.password !== password){
        throw new Error("Password doesn't match")
       }
  
        const token = jwt.sign(
            {
                id:user._id,
                user_name:user.user_name,
                email:user.email,
                
            },
            process.env.JWT_SECRET_KEY
        )
        user.password = null
         console.log(user)
        return {token:token, user:user}
    } 
    catch (error) {
        throw error
    }
}

const updateUser = async (parent , args, {req})=>{
    try {
        // console.log("here")
        // console.log(req)
        const _id = await authCheck(req)
        const name = args.input.name
        const about = args.input.about
        const user = await User.findOne({_id:_id})
        user.name = name  || user.name
        user.about = about  || user.about
        await user.save()
        return user

    } catch (error) {
      throw error  
    }
}
const uppateUserPass = async (parent , args ,{req})=>{
    try {
        const _id = await authCheck(req)
        const user = await User.findOne({_id:_id})
        const oldPass =  args.input.oldPass
        if(user.password !== oldPass){
            throw new Error("Incorect Old password Doesn't match")
        }
        const newPass = args.input.newPass
        const confirmNewPass = args.input.confirmNewPass

        if(newPass !== confirmNewPass){
            throw new Error("New password and confirm password doesn't match")
        }
        user.password = newPass
        await user.save()
        return user

    } catch (error) {
        throw error 
    }
}

const userInfo = async (parent, args, {req})=>{
    try {
        const _id = await authCheck(req)
        const user = await User.findOne({_id:_id})
        return user

    } catch (error) {
      throw error  
    }
}

module.exports = {
    Query:{
        me,
        userInfo
    },
    Mutation:{
        userCreate,
        userLogIn,
        updateUser,
        uppateUserPass,
    }
}