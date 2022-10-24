const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
    const authorization = request.get('authorization')

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }

    return null
}

const classroomsRouter = require('express').Router()
const Classroom = require('../models/classroom')
const Assistant = require('../models/assistant')

classroomsRouter.get('/', async (request, response) => {
    const name = request.query.name
    const status = request.query.status

    let classrooms = []

    if(name && status){
        classrooms = await Classroom
            .find({ name: name, status: {$in: status.split(",")}})
            .populate('assistant', { name: 1 })
    } else if(name) {
        classrooms = await Classroom
            .find({ name: name })
            .populate('assistant', { name: 1 })
    } else if(status) {
        classrooms = await Classroom
            .find({ status: {$in: status.split(",")} })
            .populate('assistant', { name: 1 })
    } else {
        classrooms = await Classroom
            .find({})
            .populate('assistant', { name: 1 })
    }

    response.json(classrooms)
})

classroomsRouter.get('/:id', async (request, response) => {
    const classroom = await Classroom
        .findById(request.params.id)
        .populate('assistant', { name: 1 })

    if (classroom) {
        response.json(classroom.toJSON())
    } else {
        response.status(404).end()
    }
})

classroomsRouter.post('/', async (request, response) => {
    const classroomName = request.body.name

    const existingClassroom = await Classroom.findOne({ name: classroomName })

    if (existingClassroom) {
        return response.status(400).json({
            error: 'Classroom name must be unique'
        })
    }

    const classroom = new Classroom({
        name: classroomName,
        status: 'ok'
    })

    const savedClassroom = await classroom.save()

    response.status(201).json(savedClassroom)
})

classroomsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const status = body.status
    const helpMessage = body.helpMessage
    
    let classroom = {}

    if(status === 'ok')
    {
        classroom = {
            status: status,
            $unset: {
                updateTime: '',
                assistant: '',
                helpMessage: ''
            }
        }
    }
    else if(status === 'help')
    {
        classroom = {
            status: status,
            updateTime: new Date(),
            helpMessage: helpMessage,
            $unset: {
                assistant: ''
            }
        }
    } else if(status === 'helping') {
        const token = getTokenFrom(request)

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }
 
        const assistant = await Assistant.findById(decodedToken.id)

        if(assistant)
        {
            classroom = {
                status: status,
                updateTime: new Date(),
                assistant: assistant
            }
        } else {
            return response.status(400).json({
                error: 'A valid assistant id is required to update the classroom'
            })
        }
    } else {
        return response.status(400).json({
            error: 'Invalid classroom status'
        })
    }

    const updatedClassroom = await Classroom.findByIdAndUpdate(request.params.id, classroom, { new: true })

    response.status(200).json(updatedClassroom)
})

module.exports = classroomsRouter