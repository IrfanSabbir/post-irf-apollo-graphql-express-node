const User= require('../model/user')


const allUser = async ()=>{
    try {
        const users = await User.find()
        return users
        
    } catch (error) {
        throw error
    }
}

const singleUser = async (parent , {user_name})=>{
    try {
        // const user_name = args.user_name
        const user = await User.findOne({user_name:user_name})
        return user
    } catch (error) {
        throw error
    }
}

module.exports = {
    Query : {
        allUser,
        singleUser
    }
}