const bcrypt = require('bcrypt')
const assistantsRouter = require('express').Router()
const Assistant = require('../models/assistant')

assistantsRouter.get('/', async (request, response) => {
    const assistants = await Assistant
        .find({})
        .populate('classrooms', { name: 1, status: 1 })

    response.json(assistants)
})

assistantsRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const existingAssistant = await Assistant.findOne({ username })
    if (existingAssistant) {
        return response.status(400).json({
            error: 'username must be unique'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const assistant = new Assistant({
        username,
        name,
        passwordHash
    })

    const savedAssistant = await assistant.save()

    response.status(201).json(savedAssistant)
})

module.exports = assistantsRouter