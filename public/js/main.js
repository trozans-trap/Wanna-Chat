const chatForm = document.getElementById('chat-form');
const chatMesages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join chatroom
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMesages.scrollTop = chatMesages.scrollHeight;
});

//Message Submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    //Clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output message to Dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add users to Dom
function outputUsers(users) {
    userList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join('')}
   `;
}