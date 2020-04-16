const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'Chatcord Bot';

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        socket.emit(
            'message',
            formatMessage(botname, 'Welcome to Wanna Chat!')); //only to user conectiong

        //Brooadcast when a user connects // to all users except connecting user
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botname, ` ${user.username} has joined the chat`)
            );
        //io.emit()//all clients in general


        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });



    //Listen to chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botname, ` ${user.username} has left the chat`)
            );
            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

        }
    });
});

Port = process.env.PORT || 5000;
server.listen(Port, () => {
    console.log(`Process running on ${Port}`);
});