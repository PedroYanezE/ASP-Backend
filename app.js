const path = require('path')
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('express-async-errors')

const classroomsRouter = require('./controllers/classrooms')
const assistantsRouter = require('./controllers/assistants')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

logger.info('connecting to', config.MONGODB_URI)

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors())

app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/classrooms', classroomsRouter)
app.use('/api/assistants', assistantsRouter)
app.use('/api/login', loginRouter)

if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'){
    app.use(express.static('build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/build/index.html'))
    })
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app