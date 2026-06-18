const jwt = require("jsonwebtoken")
const env = require('dotenv').config()

const auth = async (req,res,next) =>{
    try{
        let token = null;

        const authheader = req.headers.authorization
        if (authheader) {
            const [bearer, headerToken] = authheader.split(' ')
            if (headerToken) token = headerToken;
        }

        if (!token && req.cookies) {
            token = req.cookies.token;
        }

        if(!token) return res.json({message : "No Token Provided"})

        let decoded = await jwt.verify(token,process.env.SECRET_KEY)
        req.user = decoded
        next()
    }catch(err){
        res.json({message : "Invalid or Expired Token"})
    }
}

module.exports = auth
