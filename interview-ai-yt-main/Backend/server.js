require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const config = require("./src/config")

connectToDB()

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
})