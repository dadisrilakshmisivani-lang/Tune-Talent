const usermodel = require('../models/usermodel')
const cloudinary = require('../config/cloudinary')
const hireMail = require('../utils/hiremailservice')

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

exports.hireUser = async (req, res) => {
    try {
        const { message } = req.body
        if (!message) return res.json({ message: "Message is required" })

        // The user being hired
        let talent = await usermodel.findById(req.params.id)
        if (!talent) return res.json({ message: "Talent Not Found" })

        // The user hiring (sender)
        let sender = await usermodel.findOne({ username: req.user.username })
        if (!sender) return res.json({ message: "Sender Not Found" })

        // Prevent hiring oneself
        if (talent._id.toString() === sender._id.toString()) {
            return res.json({ message: "Cannot hire yourself" })
        }

        const emailSubject = `TuneTalent: You have a new hire inquiry from @${sender.username}!`
        const emailBody = `
        <h2>New Hire Inquiry on TuneTalent!</h2>
        <p>Hello <strong>${talent.username}</strong>,</p>
        <p>User <strong>@${sender.username}</strong> (${sender.email}) wants to hire you for a project.</p>
        
        <h3>Message from @${sender.username}:</h3>
        <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; padding: 10px 15px; font-style: italic;">
          ${message.replace(/\n/g, '<br/>')}
        </blockquote>
        
        <h3>Sender's Contact Details:</h3>
        <ul>
          <li><strong>Username:</strong> @${sender.username}</li>
          <li><strong>Email:</strong> <a href="mailto:${sender.email}">${sender.email}</a></li>
          <li><strong>Phone:</strong> ${sender.phone || "Not provided"}</li>
        </ul>
        <br/>
        <p>Best regards,<br/>The TuneTalent Team</p>
        `

        await hireMail(talent.email, talent.username, emailSubject, emailBody)

        res.status(200).json({ message: "Inquiry sent successfully" })
    } catch (err) {
        res.json({ message: err.message })
    }
}
