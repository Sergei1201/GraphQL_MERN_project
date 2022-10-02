// In this file we will connect to MongoDB
const mongoose = require('mongoose')

// Connecting to Mongo
const connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected ${conn.connection.host}`.cyan.underline)
}

module.exports = connectDB