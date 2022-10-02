// Bringing express
const express = require('express')
// Initializing express
const app = express()
// Bringing dotenv to deal with environment variables
require('dotenv').config()
// Bringing schema for using grapiql
const schema = require('./schema/Schema')
// Express body parser
app.use(express.urlencoded({extended: true})); 
app.use(express.json());   
// Bringing graphHTTP for making requests from graphiql
const {graphqlHTTP} = require('express-graphql')
// Colors package for MongoDB connection
const colors = require('colors')
// Cors
const cors = require('cors')
// MongoDB
const connectDB = require('./config/db') 

// MongoDB connection
connectDB()

// Cors middleware
app.use(cors())
  
// graphqlHTTP middleware
app.use('/graphql', graphqlHTTP({
   schema,
   graphiql: process.env.NODE_ENV === 'development' 
}))

// Creating port variable
const port = process.env.PORT || 5000
// Running the server
app.listen(port, () => console.log(`Server is running on port ${port}`))