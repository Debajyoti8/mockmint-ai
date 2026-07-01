const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const config = require("../config")


/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        config.jwtSecret,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, config.cookie)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        config.jwtSecret,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, config.cookie)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @description Change user password, invalidating current session on success.
 */
async function changePasswordController(req, res) {
    const { currentPassword, newPassword } = req.body

    // 1. Basic validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required."
        })
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters long."
        })
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            message: "New password cannot be the same as your current password."
        })
    }

    // 2. Fetch user
    const user = await userModel.findById(req.user.id)
    if (!user) {
        return res.status(404).json({
            message: "User not found."
        })
    }

    // 3. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid current password."
        })
    }

    // 4. Hash and save new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()

    // 5. Clear cookie token session
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    })

    res.status(200).json({
        message: "Password updated successfully. Please log in again."
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    changePasswordController
}