const wr = require("web-request");
const sql = require("sqlite3");


class Server {
    constructor(data) {
        this.ip = data.ip;
        this.port = data.port;
        return this;
    }
}

module.exports = Server;