const mongoose = require('mongoose')

const assistantSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        minLength: 5,
    },
    name: {
        type: String,
        require: true,
    },
    passwordHash: {
        type: String,
        require: true
    },
    classrooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom'
        }
    ]
})

assistantSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Assistant', assistantSchema)