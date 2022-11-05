const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

const { Server } = require("socket.io")
const io = new Server(server)

io.on('connection', (socket) => {
    socket.on('help', (arg) => {
        socket.to('assistants').emit('HELP', arg)
    });

    socket.on('helping', (arg) => {
        socket.to(arg).emit('helping', arg);
    });

    socket.on('helped', (arg) => {
        socket.to(arg).emit('helped', arg);
    });

    socket.on('join', (arg) => {
        if(arg === 'assistants'){
            socket.join('assistants');
        } else {
            socket.join(arg);
        };
    });

    socket.on('disconnect', () => {

    });
});

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
});