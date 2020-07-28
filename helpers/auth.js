const jwt = require('jsonwebtoken')

exports.authCheck = async (req)=>{
    try {
       const token = req.headers.authorization.split(' ')[1] 
      
       const decodeToken = jwt.verify(token , process.env.JWT_SECRET_KEY)
       if(!decodeToken){
           throw new Error("Wrong token")
       }
       const _id = decodeToken.id
       return _id
    } catch (error) {
        console.log(error)
        throw new Error("Invalid auth token")
    }
}

exports.restAuthCheck = async (req, res, next)=>{
    try {
        const token = req.headers.authorization.split(' ')[1] 
      
        const decodeToken = jwt.verify(token , process.env.JWT_SECRET_KEY)
        if(!decodeToken){
            throw new Error("Wrong token")
        }
        req.id = decodeToken.id
        next()
    } catch (error) {
        res.json({
            error:error.message
        })
    }
}