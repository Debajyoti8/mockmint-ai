const mongoose = require("mongoose")
const config = require("./index")

async function connectToDB() {

    try {
        await mongoose.connect(config.mongoUri)

        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}


module.exports = connectToDB