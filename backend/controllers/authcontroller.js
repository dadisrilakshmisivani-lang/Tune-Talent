const usermodel = require('../models/usermodel')
const jwt = require("jsonwebtoken")
const env = require('dotenv').config()
const bcrypt = require("bcrypt")
const mail = require('../utils/gmail.js')

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.json({ message: "Error Missing Fields" })
        }
        if (await usermodel.findOne({ username }) && await usermodel.findOne({ email })) {
            return res.json({ message: "User Already registered" })
        }
        const hashed = await bcrypt.hash(password, 10)
        await usermodel.create({ username, password: hashed, email });

        let payload = { username: username, email: email }
        let token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10hr' })

        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 10 * 60 * 60 * 1000
        });

        await mail(email, username);
        res.status(201).json({ message: "User Registered Successfully", token: token })

    } catch (err) {
        res.json({ message: err.message })
    }
}

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.json({ message: "missing fields" })
        }

        let checkuser = await usermodel.findOne({ username })
        if (!checkuser) return res.json({ message: "user not found" })

        let valid = await bcrypt.compare(password, checkuser.password)
        if (!valid) return res.json({ message: "Invalid Credentials" })

        let payload = { username: checkuser.username, email: checkuser.email }
        let token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '10hr' })

        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 10 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login Successful", token: token })
    } catch (err) {
        res.json({ message: err.message })
    }
}
