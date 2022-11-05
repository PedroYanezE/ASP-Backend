const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const Assistant = require('../models/assistant');

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body;

    const assistant = await Assistant.findOne({ username });
    const passwordCorrect = assistant === null
        ? false
        : await bcrypt.compare(password, assistant.passwordHash);

    if(!(assistant && passwordCorrect))
    {
        return response.status(401).json({
            error: 'Invalid username or password'
        });
    };

    const assistantForToken = {
        username: assistant.username,
        id: assistant._id
    };

    const token = jwt.sign(
        assistantForToken, 
        process.env.JWT_SECRET,
        { expiresIn: 60*60*6 } // 6 horas
    );

    response
        .status(200)
        .send({ token, username: assistant.username, name: assistant.name, id: assistant._id })
});

module.exports = loginRouter;