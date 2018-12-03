const Lobby = require('./shared/model/lobby');
const User = require('./shared/model/user');
const ProgressState = require('./shared/model/progressState');
const StartLobbyAckMessage = require('./shared/protocol/startLobbyAck');
const short_id = require('shortid');
const WebSocket = require('ws');

const PORT = 3000;

class LDNServer {

    constructor(start=true) {
        this.lobbies = {}
        process.on('exit', () => { this._exitHandler() });
        process.on('SIGINT', () => { this._exitHandler() });
        process.on('uncaughtException', () => { this._exitHandler() });
        if (start) {
            this._start();
        }
    }

    // ========
    // Handlers
    // ========

    _exitHandler() {
        if (this.server) this.server.close();
    }

    _onConnection(socket) {

        console.log('<Info> Connection received from: ', req.connection.remoteAddress);
        socket.on('message', (msg) => {
            this._onMessage(socket, msg);
        });

    }

    _onMessage(socket, from, msg) {

        const data = JSON.parse(msg);
        if (!data) {
            console.log('<Error> Server received janky JSON data!');
            return;
        }

        console.log('<Info> received message with type: ', data.type);
        if (data.type == 'start_lobby') {
            this.startLobby(socket);
        }

    }

    // ===============
    // Private Methods
    // ===============

    _start() {
        this.server = new WebSocket.Server({port: PORT});
        console.log('<Info> Listening on port: ', PORT);
        this.server.on('connection', this._onConnection);
    }

    // ==============
    // Public Methods
    // ==============

    contains(lobbyId) {
        return (lobbyId in this.lobbies);
    }

    addLobby(lobby) {
        if (!this.contains(lobby.id)) this.lobbies[lobby.id] = lobby;
    }

    isConnected(user) {
        for (lobbyId in this.lobbies) {
            const lobby = this.lobbies[lobbyId];
            if (lobby.contains(user)) {
                return true;
            }
        }
        return false;
    }

    startLobby(socket) {
        if (!data.user) {
            console.log('<Error> Tried to start a lobby without a user!');
            return;
        }
        

        const lobbyId = short_id.generate();
        const user = User.fromJson(data.user);
        if (this.isConnected(user)) {
            console.log('<Error> User is already connected. ID: ', str(user.id));
            return;
        }
        const lobby = Lobby(lobbyId, user);
        this.addLobby(lobby);
        socket.send((new StartLobbyAckMessage(user)).toJson());
        this.printLobbies();
    }

    printLobbies() {
        console.log('<Info> New lobby information:');
        console.log(this.lobbies)
    }

}

const ldnServer = new LDNServer(true);