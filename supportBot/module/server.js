class Server {
    constructor(data) {
        this.ip = data.ip;
        this.port = data.port;
        this.name = data.name;
        return this;
    }
}

module.exports = Server;