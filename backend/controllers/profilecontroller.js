const usermodel = require('../models/usermodel')
const cloudinary = require('../config/cloudinary')

exports.getprofile = async (req, res) => {
    try {
        let user = await usermodel.findOne({ username: req.user.username })
        if (!user) return res.json({ message: "User Not Found" })

        res.status(200).json({ message: "Profile Fetched", user: user })
    } catch (err) {
        res.json({ message: err.message })
    }
}

exports.getuserprofile = async (req, res) => {
    try {
        let user = await usermodel.findById(req.params.id)
        if (!user) return res.json({ message: "User Not Found" })

        res.status(200).json({ message: "Profile Fetched", user: user })
    } catch (err) {
        res.json({ message: err.message })
    }
}

exports.getallusers = async (req, res) => {
    try {
        let users = await usermodel.find({})
        res.status(200).json({ message: "Users Fetched", users: users })
    } catch (err) {
        res.json({ message: err.message })
    }
}

exports.updateprofile = async (req, res) => {
    try {
        let user = await usermodel.findOne({ username: req.user.username })
        if (!user) return res.json({ message: "User Not Found" })

        const { bio, phone } = req.body
        if (bio) user.bio = bio
        if (phone) user.phone = phone

        if (req.file) {
            const base64 = req.file.buffer.toString('base64')
            const datauri = `data:${req.file.mimetype};base64,${base64}`
            const result = await cloudinary.uploader.upload(datauri, {
                folder: 'tunetalent/profiles'
            })
            user.profileimage = result.secure_url
        }

        await user.save()
        res.status(200).json({ message: "Profile Updated", user: user })
    } catch (err) {
        res.json({ message: err.message })
    }
}
