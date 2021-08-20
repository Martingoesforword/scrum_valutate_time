const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors:
        {
            origin: 'http://localhost:4200',
            credentials: true
        },

});

let rooms = {};

io.on('connection', (socket) => {
    console.log('User connected to the socket.');

    //when the socket recieves a new vote
    socket.on('vote', (userInfo) => {
        // console.log(userInfo);
        if((!userInfo.roomId) || (userInfo.roomId && !rooms[userInfo.roomId])) {
            //生成一个 roomId 来表示新房间号
            let roomId = userInfo.roomId || Date.now();
            rooms[roomId] = {
                manager:userInfo.name,
                allVotes:[],
                allSockets:[]
            };
            userInfo.roomId = roomId;
        }
        if(rooms[userInfo.roomId]) {
            if(rooms[userInfo.roomId]["allSockets"].indexOf(socket) === -1) {
                //添加用户
                rooms[userInfo.roomId]["allSockets"].push(socket);
            }
            updateVote(userInfo.roomId, userInfo);
            // socket.emit('allVotes', allVotes);
            console.log(rooms[userInfo.roomId]["allVotes"]);
            refreshVotes(userInfo.roomId, rooms[userInfo.roomId]["manager"]);
        }
    });

    socket.on('reset', (userInfo) => {
        if(!userInfo.roomId)
        {
            //无房间id则自动退出
            return;
        }
        if(rooms[userInfo.roomId]) {
            rooms[userInfo.roomId]["allVotes"] = [];
            refreshVotes(userInfo.roomId);

            rooms[userInfo.roomId]["allSockets"].forEach(playerSocket => {
                playerSocket.emit('hideCards');
            });
        }
    });

    socket.on('showCards', (userInfo) => {
        if(!userInfo.roomId)
        {
            //无房间id则自动退出
            return;
        }
        if(rooms[userInfo.roomId]) {
            rooms[userInfo.roomId]["allSockets"].forEach(playerSocket => {
                playerSocket.emit('showCards');
            });
        }
    });

    socket.on('resetVotes', (userInfo) => {
        if(!userInfo.roomId)
        {
            //无房间id则自动退出
            return;
        }
        console.log('resetting all Votes');
        if(rooms[userInfo.roomId]) {
            rooms[userInfo.roomId]["allVotes"].forEach(entry => {
                entry.voteValue = 0;
            })
            refreshVotes(userInfo.roomId);
            rooms[userInfo.roomId]["allSockets"].forEach(playerSocket => {
                playerSocket.emit('hideCards');
            });
        }
    })


});

function checkIfUserAlreadyExists(roomId, username) {
    let result = false;
    rooms[roomId]["allVotes"].forEach(userInfo => {
        if (userInfo.name === username) {
            result = true;
        }
    });
    return result;
}

function updateVote(roomId, userInfo) {

    if (checkIfUserAlreadyExists(roomId, userInfo.name)) {
        rooms[roomId]["allVotes"].forEach(voteData => {
            if (voteData.name === userInfo.name) {
                voteData.voteValue = userInfo.voteValue;
                console.log('Vote for the user: ' + userInfo.name + ' already exists');
            }
        });
    } else {
        rooms[roomId]["allVotes"].push(userInfo);
        console.log('New vote added from user ' + userInfo.name + '.');
    }
}

function refreshVotes(roomId, manager) {
    rooms[roomId]["allSockets"].forEach(playerSocket => {
        playerSocket.emit('allVotes', {'allVotes':rooms[roomId]["allVotes"], 'roomId':roomId, 'manager': manager});
    })
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});
