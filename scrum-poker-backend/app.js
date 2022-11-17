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
        // 如果此socket中带有房间信息，判断此人重连，如果没有此房间，则以他的名义帮房主创建一个
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
            rooms[userInfo.roomId]["allSockets"][userInfo.name] = socket;
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
            refreshVotes(userInfo.roomId, rooms[userInfo.roomId]["manager"]);

            for (const key in rooms[userInfo.roomId]["allSockets"]) {
                var playerSocket = rooms[userInfo.roomId]["allSockets"][key];
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
            for (const key in rooms[userInfo.roomId]["allSockets"]) {
                var playerSocket = rooms[userInfo.roomId]["allSockets"][key];
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
            for (const key in rooms[userInfo.roomId]["allVotes"]) {
                var playerVote = rooms[userInfo.roomId]["allVotes"][key];
                playerVote.voteValue = 0;
            }
            refreshVotes(userInfo.roomId, rooms[userInfo.roomId]["manager"]);
            for (const key in rooms[userInfo.roomId]["allSockets"]) {
                var playerSocket = rooms[userInfo.roomId]["allSockets"][key];
                playerSocket.emit('hideCards');
            }
        }
    })
    /**
     * 断开socket连接后，清理房间里的人，如果房间没有人了，则清理房间
     */
    socket.on('disconnect', () => {
        if(!rooms[socket.roomId] || !rooms[socket.roomId]["allSockets"] || !rooms[socket.roomId]["allSockets"][socket.ownerName]) return;
        // 需要处理的数据有房间列表，房间内的投票列表，房间内的sockets连接列表
        delete rooms[socket.roomId]["allSockets"][socket.ownerName];
        delete rooms[socket.roomId]["allVotes"][socket.ownerName];

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
            refreshVotes(socket.roomId, rooms[socket.roomId]["manager"]);
        }
    })

});

function checkIfUserAlreadyExists(roomId, username) {
    let result = false;
    for (const key in rooms[roomId]["allVotes"]) {
        var playerVote = rooms[roomId]["allVotes"][key];
        if (playerVote.name === username) {
            result = true;
        }
    }
    return result;
}

function updateVote(roomId, userInfo, socket) {

    if (checkIfUserAlreadyExists(roomId, userInfo.name)) {
        for (const key in rooms[roomId]["allVotes"]) {
            var voteData = rooms[roomId]["allVotes"][key];
            if (voteData.name === userInfo.name) {
                voteData.voteValue = userInfo.voteValue;
                console.log('Vote for the user: ' + userInfo.name + ' already exists');
            }
        }
    } else {
        rooms[roomId]["allVotes"][userInfo.name] = userInfo;
        console.log('New vote added from user ' + userInfo.name + '.');
    }
}

function refreshVotes(roomId, manager) {

    for (const key in rooms[roomId]["allSockets"]) {
        var playerSocket = rooms[roomId]["allSockets"][key];
        if(playerSocket.ownerName === manager) {
            var all_votes_array = [];
            for (const key in rooms[roomId]["allVotes"]) {
                var playerVote = rooms[roomId]["allVotes"][key];
                all_votes_array.push(playerVote);
            }
            playerSocket.emit('allVotes', {'allVotes':all_votes_array, 'roomId':roomId, 'manager': manager});
        }
        else {
            var tempVotes = [];
            for (const key in rooms[roomId]["allVotes"]) {
                var userInfo = rooms[roomId]["allVotes"][key];
                if (userInfo.name === playerSocket.ownerName) {
                    tempVotes.push(userInfo);
                }
                else {
                    tempVotes.push({
                        name: userInfo.name,
                        // 如果本身为0，说明是没有投票，传0即可，如果有投票，则不是0，直接传-1即可
                        voteValue: userInfo.voteValue === 0? 0:-1,
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
