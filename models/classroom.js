const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        minLength: 3,
    },
    status: {
        type: String,
        required: true,
    },
    helpMessage: {
        type: String,
        require: false,
    },
    updateTime: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
    assistant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assistant'
    }
})

classroomSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Classroom', classroomSchema)