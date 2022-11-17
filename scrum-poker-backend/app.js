const app = require('express')();
const http = require('http').Server(app);
const engine = require('socket.io');
const io = engine(http, {
    cors:
        {
            origin: '*',
            credentials: true,
            allowPrivateNetwork: true,
        },
    pingTimeout: 50000,
    pingInterval: 60000
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
                allVotes: {},
                allSockets: {}
            };
            userInfo.roomId = roomId;
        }
        socket.ownerName = userInfo.name;
        socket.roomId = userInfo.roomId;
        if(rooms[userInfo.roomId]) {
            // 添加用户
            rooms[userInfo.roomId]["allSockets"][socket] = true;
            updateVote(userInfo.roomId, userInfo, socket);
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
            rooms[userInfo.roomId]["allVotes"] = {};
            refreshVotes(userInfo.roomId);

            for (const playerSocket of rooms[userInfo.roomId]["allSockets"]) {
                playerSocket.emit('hideCards');
            }
        }
    });

    socket.on('showCards', (userInfo) => {
        if(!userInfo.roomId)
        {
            //无房间id则自动退出
            return;
        }
        if(rooms[userInfo.roomId]) {
            for (const playerSocket of rooms[userInfo.roomId]["allSockets"]) {
                playerSocket.emit('showCards');
            }
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
            for (const playerVote of rooms[userInfo.roomId]["allVotes"]) {
                playerVote.voteValue = 0;
            }
            refreshVotes(userInfo.roomId);
            for (const playerSocket of rooms[userInfo.roomId]["allSockets"]) {
                playerSocket.emit('hideCards');
            }
        }
    })
    /**
     * 断开socket连接后，清理房间里的人，如果房间没有人了，则清理房间
     * TODO: 有效性检查
     */
    socket.on('disconnect', () => {
        // 需要处理的数据有房间列表，房间内的投票列表，房间内的sockets连接列表
        delete rooms[socket.roomId]["allSockets"][socket];
        delete rooms[socket.roomId]["allVotes"][socket];

        var exist_any_one = 0;
        for (const key in rooms[socket.roomId]["allVotes"]) {
            exist_any_one++;
            break
        }
        if(!exist_any_one) {
            // 清理房间
            delete rooms[socket.roomId];
        }
        else {
            refreshVotes(socket.roomId);
        }
    })

});

function checkIfUserAlreadyExists(roomId, username) {
    let result = false;
    for (const playerVote of rooms[roomId]["allVotes"]) {
        if (playerVote.name === username) {
            result = true;
        }
    }
    return result;
}

function updateVote(roomId, userInfo, socket) {

    if (checkIfUserAlreadyExists(roomId, userInfo.name)) {
        for (const voteData of rooms[roomId]["allVotes"]) {
            if (voteData.name === userInfo.name) {
                voteData.voteValue = userInfo.voteValue;
                console.log('Vote for the user: ' + userInfo.name + ' already exists');
            }
        }
    } else {
        rooms[roomId]["allVotes"][socket] = userInfo;
        console.log('New vote added from user ' + userInfo.name + '.');
    }
}

function refreshVotes(roomId, manager) {

    for (const playerSocket of rooms[roomId]["allSockets"]) {
        if(playerSocket.ownerName === manager) {
            var all_votes_array = [];
            for (const playerVote of rooms[roomId]["allVotes"]) {
                all_votes_array.push(playerVote);
            }
            playerSocket.emit('allVotes', {'allVotes':all_votes_array, 'roomId':roomId, 'manager': manager});
        }
        else {
            var tempVotes = [];
            for (const userInfo of rooms[roomId]["allVotes"]) {
                if (userInfo.name === playerSocket.ownerName) {
                    tempVotes.push(userInfo);
                }
                else {
                    tempVotes.push({
                        name: userInfo.name,
                        voteValue: -1,
                        roomId: userInfo.roomId
                    });
                }
            }
            playerSocket.emit('allVotes', {'allVotes':tempVotes, 'roomId':roomId, 'manager': manager === playerSocket.ownerName});
        }
    }
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});
