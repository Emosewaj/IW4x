const wr = require("web-request"), fs = require("fs"), Server = require("./module/server.js"), /*sql = require("sqlite3"),*/ Discord = require("discord.js");
const self = new Discord.Client({
    messageCacheMaxSize: 5,
    messageCacheLifetime: 30,
    messageSweepInterval: 600,
    disableEveryone: true,
    sync: false,
    disabledEvents: [
        "GUILD_ROLE_CREATE",
        "GUILD_ROLE_DELETE",
        "GUILD_ROLE_UPDATE",
        "CHANNEL_PINS_UPDATE",
        "MESSAGE_DELETE",
        "MESSAGE_UPDATE",
        "MESSAGE_DELETE_BULK",
        "MESSAGE_REACTION_ADD",
        "MESSAGE_REACTION_REMOVE",
        "MESSAGE_REACTION_REMOVE_ALL",
        "VOICE_STATE_UPDATE",
        "TYPING_START",
        "VOICE_SERVER_UPDATE",
        "RELATIONSHIP_ADD",
        "RELATIONSHIP_REMOVE"
    ]
});

function resetActivity() {
    setTimeout(function() {
        self.customActivity = false;
        randomPresence();
    },7200000);
}

function randomPresence() {
    if (self.customActivity) return;
    let num = Math.floor(Math.random()*(self.memes.length+1));
    self.user.setActivity(self.memes[num]);
    setTimeout(function() {randomPresence()},1800000);
}

function addServer(ip) {
    let port = ip.split(":")[1];
    ip = ip.split(":")[0];
    if (self.servers.has(ip)) return;
    self.servers.set(`${ip}:${port}`,new Server({ip, port}));
    saveServers();
}

function deleteServer(ip) {
    self.servers.delete(ip);
    saveServers();
}

function saveServers() {
    let dataServers = [];
    self.servers.forEach(server => dataServers.push(server));
    fs.writeFile("./data/servers.json",JSON.stringify(dataServers,"",1),"utf8",(cb,err) => {if (err) {throw err}});
}

function parseKeywords(text,keywords) {
    for (let i in keywords) {
        if (text.includes(keywords[i])) return true;
    }
    return false;
}

function init() {
    self.config = require("./data/config.json");
    self.mutes = require("./data/mutes.json");
    self.embeds = require("./data/embeds.json");
    self.joins = require("./data/joins.json");self.days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];self.today = new Date().getUTCDay();
    self.servers = new Discord.Collection();
    let servers = require("./data/servers.json");
    for (let i in servers) {
        self.servers.set(`${servers[i].ip}:${servers[i].port}`, new Server(servers[i]));
    }
    self.memes = ["IW4x Support","Type your problem into #support!","IW4x v0.5.4","Call of Duty: Modern Warfare 2","Spacewar","Not a neural network!","Updated frequently!","Tech Support","Indian Tech Support",":flag_au:","+set net_port <28960>","help cant create iw4play account 😦", "fatal error","👀","/dev/console","BotWarfare","24/7 Terminal","zombie warfare 2 by santahunter","iMeme","#nsfw-meme-philosophy is my favourite channel","Rocket V2 was better","🚀🇻2","Running on german engineering!","Plutekno5xplayv2delta1revolution","with 300 ungrateful indian pirates","MW2:R","closed source ☹️","Advanced BotWarfare"];
    self.login(self.config.token);
}

self.on("ready", () => {
    self.customActivity = false;
    randomPresence();
    if (self.mutes.length == 0) fetchMutes();
    self.channels.get("419968973287981061").send({embed: new Discord.RichEmbed().setTitle(`IW4x Bot`).addField("Status",self.user.presence.status,true).addField("Version","v0.5.4",true).addField("Guilds",self.guilds.size,true).addField("RAM Usage",`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`,true).setColor(self.guilds.get("292040520648228864").me.displayHexColor).setThumbnail(self.user.displayAvatarURL)});   
});

self.on("message", m => {
    if (m.author == self.user || m.channel.type == "dm") return;
    let originalMessage = m.content.toLowerCase();
    let regexPattern = /(\d+)(.*?)(server)/;
    let result = originalMessage.match(regexPattern); //Should be a number ,followed by 0-inf whitespaces and "server"
    let count = NaN;
    if (result) count = parseInt(result[0]);

    if (m.channel.permissionsFor(self.user).has("MANAGE_MESSAGES")) {
        for (let i in self.config.keywords) {
            if (m.content.includes(self.config.keywords[i])) return m.delete();
        }
    }

    if (m.mentions.members.size > 5) m.member.kick("Mention spammer").then(member => m.channel.send(`Don't spam you cuck, kicked. Bye bye ${member.user.username}!`));

    if (m.content.startsWith("!")) {
        if (m.content.startsWith("!request")) {
            return self.users.get("211227683466641408").send(`Request from ${m.author.tag}: ${m.content.split(" ").slice(1).join(" ")}`).then(() => {
                return m.channel.send("Your request was submitted!");
            });
        }
    }

    if (m.content.startsWith("!") && (m.author.id == "211227683466641408" || m.member.roles.has("389196122645856266") || m.member.roles.has("277148294705053696") || m.member.roles.has("276772587629969408") || m.member.roles.has("265852393743319042") || m.member.roles.has("244553794380234752"))) {
        if (m.content.startsWith("!kick")) {
            if (m.mentions.members.first()) {
                m.mentions.members.first().kick("Kicked by staff").then(member => m.channel.send(`Kicked ${member.user.tag}!`), err => m.channel.send(`Failed to kick ${m.mentions.users.first().tag}:\n${err}`));
            }
        } else if (m.content.startsWith("!ban")) {
            if (m.mentions.members.first()){
                m.mentions.members.first().ban("Banned by staff").then(member => m.channel.send(`Banned ${member.user.tag}!`), err => m.channel.send(`Failed to ban ${m.mentions.users.first().tag}:\n${err}`))
            } else if (!isNaN(parseInt(m.content.split(" ")[1]))) {
                m.guild.ban(m.content.split(" ")[1],{reason:"Banned by staff"}).then(member => m.channel.send(`Banned <@${m.content.split(" ")[1]}!`), err => m.channel.send(`Failed to ban user:\n${err}`));
            }
        } else if (m.content.startsWith("!unban")) {
            if (!isNaN(parseInt(m.content.split(" ")[1]))) {
                m.guild.unban(m.content.split(" ")[1],"Unbanned by staff").then(user => m.channel.send(`Unbanned ${user.tag}!`), err => m.channel.send(`Failed to unban user:\n${err}`));
            }
        } else if (m.content.startsWith("!presence")) {
            return self.user.setActivity(m.content.split(" ").slice(2).join(" "),{type: m.content.split(" ")[1].toUpperCase()}).then(() => {
                self.customActivity = true;
                resetActivity();
                return m.channel.send(`Now ${m.content.split(" ")[1].toLowerCase()} ${m.content.split(" ").slice(2).join(" ")}!`);
            }, err => {
                return m.channel.send(`Oops, that didn't work: ${err}`);
            });
        }
    }

    m.content = originalMessage.split(" ");
    if (m.channel.type == "text" && self.config.allowedChannels.includes(m.channel.id) && !m.content[0].startsWith("!") && m.content[0] != "<@394079419964063744>") {
        if (m.content.includes("vac")) return m.channel.send({embed:self.embeds.vac})
        if (parseKeywords(m.content,["download","get","free"]) && parseKeywords(m.content,["dlc","dlcs"])) return m.channel.send({embed:self.embeds.dlc});
        if (parseKeywords(m.content,["download","get","free","install"]) && (parseKeywords(m.content,["mw2","modern warfare","modern warfare 2"]))) return m.channel.send({embed:self.embeds.game});
        if (parseKeywords(m.content,["download","get","free","install"]) && parseKeywords(m.content,["iw4x","iw4"])) return m.channel.send({embed:self.embeds.iw4x});
        if ((parseKeywords(m.content,["no","all","find","any","few","low"]) && parseKeywords(m.content,["server","servers"])) || (count != NaN && count < self.config.minServers)) return m.channel.send({embed:self.embeds.servers});
        if (m.content.includes("fatal") && m.content.includes("error")) return m.channel.send({embed:self.embeds.fatal});
        if (parseKeywords(m.content,["friend","friends"])) return m.channel.send({embed:self.embeds.friends});
        if (m.content.includes("help") && !parseKeywords(m.content,["thank","thanks","thx"])) return m.channel.send("Please state your problem! If I cannot help, someone who can will come and reply to you shortly!");
    }

    if (m.content[0] == "<@394079419964063744>" && !m.content[0].startsWith("!")) {
        switch(m.content[1]) {
            case "info": return m.channel.send({embed: {fields: [{name:"Uptime",value:parseUptime(process.uptime())},{name:"Memory Usage",value:parseUsage(process.memoryUsage().heapUsed)}]}});
            case "test": {
                if (m.author.id != "211227683466641408") return m.channel.send({embed: {description:"Access denied."}});
                let status = ["VIEW_CHANNEL","SEND_MESSAGES","EMBED_LINKS"];
                for (let i in status) {if (m.channel.permissionsFor(m.guild.me).has(status[i])) {status[i] = true} else {status[i] = false}}
                return m.channel.send(`\`${status.join(", ")}\``);
            }
            case "restart": {
                if (m.author.id != "211227683466641408") return m.channel.send({embed: {description:"Access denied."}});
                return m.channel.send({embed: {description:"Restarting..."}}).then(() => process.exit(1));
            }
            case "joins": {
                let today = new Date().getUTCDay();
                if (today != self.today) {
                    self.joins[today-1] = 0;
                    self.today = today;
                }
                let toSend = "";
                for (let i in self.joins) {
                    if (i < today-1) {
                        toSend += `This ${self.days[i]}: ${self.joins[i]}\n`;
                    } else if (i == today-1) {
                        toSend += `Today: ${self.joins[i]}\n`;
                    } else if (i > today-1) {
                        toSend += `Last ${self.days[i]}: ${self.joins[i]}\n`;
                    }
                }
                return m.channel.send({
                    embed: new Discord.RichEmbed()
                    .setTitle("Members joined in the last week")
                    .setDescription(toSend)
                });
            }
            case "ping": {
                m.reply("attempting to connect...").then(msg => {
                    let ip = m.content[2];
                    if (!ip.includes(":")) {
                        ip = `${ip}:28960`;
                    }
                    wr.get(`http://${ip}/info`,{timeout:3000}).then(response => {
                        if (response.statusCode != 200) {
                            return msg.edit(`There was an error trying to connect to ${ip}!\nCode: ${response.statusCode}\nMessage: ${response.statusMessage}`);
                        }
                        let server = JSON.parse(response.content).status,players = JSON.parse(response.content).players;
                        if (!server.fs_game) server.fs_game = "None";
                        let embed = new Discord.RichEmbed()
                        .setAuthor(server.sv_hostname.replace(/\^[0-9:;c]/g, ""))
                        .setDescription("**Serverinfo**")
                        .addField("Map:",server.mapname,true)
                        .addField("Gametype:",server.g_gametype,true)
                        .addField("Players:",`${players.length}/${server.sv_maxclients}`,true)
                        .addField("Mod:",server.fs_game.replace(/^mods\//g, ""),true)
                        .addField("Security Level:",server.sv_securityLevel,true)
                        .addField("Password Protected:",toBool(server.isPrivate),true)
                        .addField("Hardcore Mode:",toBool(server.g_hardcore),true)
                        .addField("KillCam:",toBool(server.scr_game_allowkillcam),true)
                        .addField("Friendly Fire:",getFFType(server.scr_team_fftype),true)
                        .addField("\u200B",`[Click here to join!](http://${ip})`);
                        msg.edit({embed});
                        return addServer(ip);
                    }).catch(err => {
                        return msg.edit(`There was an error trying to connect to ${ip}!\n${err}`);
                    });
                });
                return;
            }
            case "find": {
                let searchQuery = m.content;
                searchQuery.shift();searchQuery.shift();
                searchQuery = searchQuery.join(" ");
                function findServer(query) {
                    let result = self.servers.find(server => {if (server.name.toLowerCase().includes(query.toLowerCase())) {return true} else {return false}});
                    if (!result) {
                        m.channel.send(`No servers found with the name ${query}!`);
                    } else {
                        wr.get(`http://${result.ip}:${result.port}/info`,{timeout:3000}).then(response => {
                            if (response.statusCode != 200) {
                                msg.edit(`There was an error trying to connect to ${result.ip}!\nCode: ${response.statusCode}\nMessage: ${response.statusMessage}`);
                                return;
                            }
                            let server = JSON.parse(response.content).status,players = JSON.parse(response.content).players;
                            if (!server.fs_game) server.fs_game = "None";
                            let embed = new Discord.RichEmbed()
                            .setAuthor(server.sv_hostname.replace(/\^[0-9:;c]/g, ""))
                            .setDescription("**Serverinfo**")
                            .addField("Map:",server.mapname,true)
                            .addField("Gametype:",server.g_gametype,true)
                            .addField("Players:",`${players.length}/${server.sv_maxclients}`,true)
                            .addField("Mod:",server.fs_game.replace(/^mods\//g, ""),true)
                            .addField("Security Level:",server.sv_securityLevel,true)
                            .addField("Password Protected:",toBool(server.isPrivate),true)
                            .addField("Hardcore Mode:",toBool(server.g_hardcore),true)
                            .addField("KillCam:",toBool(server.scr_game_allowkillcam),true)
                            .addField("Friendly Fire:",getFFType(server.scr_team_fftype),true)
                            .addField("\u200B",`[Click here to join!](http://${result.ip}:${result.port})`);
                            m.channel.send("Found a server!",{embed});
                        }).catch(err => {
                            m.channel.send(`A server was found but seems to be offline! Removing it from the server list!`);
                            deleteServer(`${result.ip}:${result.port}`);
                            findServer(query);
                        });
                    }
                }
                findServer(searchQuery);
                return;
            }
            case "check": {
                let servers = [];
                self.servers.forEach(server => {
                    servers.push(`${server.ip}:${server.port}`);
                });
                m.channel.send(`Checking ${servers.length} servers...`).then(msg => {
                    let online = 0, offline = 0, amount = servers.length, checked = 0;
                    function checkServer(ip) {
                        checked++;
                        wr.get(`http://${ip}/info`,{timeout:3000}).then(response => {
                            if (response.statusCode != 200) {
                                offline++;
                                deleteServer(ip);
                                if (servers.length == 0) {
                                    msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline and deleted`);
                                    return;
                                } else {
                                    let bar = loadingBar(amount,checked);
                                    if (bar.bool) {
                                        msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                    }
                                    checkServer(servers.shift());
                                    return;
                                }
                            } else {
                                online++;
                                if (servers.length == 0) {
                                    msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline and deleted`);
                                    return;
                                } else {
                                    let bar = loadingBar(amount,checked);
                                    if (bar.bool) {
                                        msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                    }
                                    checkServer(servers.shift());
                                    return;
                                }
                            }
                        }).catch(err => {
                            offline++;
                            deleteServer(ip);
                            if (servers.length == 0) {
                                msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline and deleted`);
                                return;
                            } else {
                                let bar = loadingBar(amount,checked);
                                if (bar.bool) {
                                    msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                }
                                checkServer(servers.shift());
                                return;
                            }
                        });
                    }
                    checkServer(servers.shift());
                });
                break;
            }
            case "parse": {
                let servers = require("./data/favourites.json");
                m.channel.send(`Checking ${servers.length} servers...`).then(msg => {
                    let online = 0, offline = 0, amount = servers.length, checked = 0;
                    function parseFavourites(ip) {
                        checked++;
                        wr.get(`http://${ip}/info`,{timeout:3000}).then(response => {
                            if (response.statusCode != 200) {
                                offline++;
                                if (servers.length == 0) {
                                    msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline.`);
                                    return;
                                } else {
                                    let bar = loadingBar(amount,checked);
                                    if (bar.bool) {
                                        msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                    }
                                    parseFavourites(servers.shift());
                                    return;
                                }
                            } else {
                                online++;
                                addServer(ip);
                                if (servers.length == 0) {
                                    msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline and deleted`);
                                    return;
                                } else {
                                    let bar = loadingBar(amount,checked);
                                    if (bar.bool) {
                                        msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                    }
                                    parseFavourites(servers.shift());
                                    return;
                                }
                            }
                        }).catch(err => {
                            offline++;
                            if (servers.length == 0) {
                                msg.edit(`All servers checked! Results:\n${online} servers online\n${offline} servers offline and deleted`);
                                return;
                            } else {
                                let bar = loadingBar(amount,checked);
                                if (bar.bool) {
                                    msg.edit(`Checking ${amount} servers...\nProgress: ${bar.percentage}% ${bar.bar}`);
                                }
                                parseFavourites(servers.shift());
                                return;
                            }
                        });
                    }
                    parseFavourites(servers.shift());
                });
                break;
            }
            case "lmgtfy":
            case "google": {
                return m.channel.send({
                    embed: new Discord.RichEmbed()
                    .setTitle("Googling isn't hard!")
                    .setDescription(`So **l**et **m**e **g**oogle **t**hat **f**or **y**ou:\n\n[Click here!](http://lmgtfy.com/?q=${m.content.slice(2).join("+")})`)
                    .setThumbnail("http://lmgtfy.com/assets/logo-color-small-70dbef413f591a3fdfcfac7b273791039c8fd2a5329e97c4bfd8188f69f0da34.png")
                    .setColor("WHITE")
                });
                break;
            }
            case "iw4madmin": {
                m.channel.send("Attempting to fetch data...").then(msg => {
                    wr.get("http://api.raidmax.org:5000/instance/", {timeout:3000}).then(response => {
                        if (response.statusCode != 200) {
                            return msg.edit(msg.content+`\nThere was an error trying to fetch data!\n\nCode: ${response.statusCode}\nMessage: ${response.statusMessage}`);
                        }
                        msg.edit("Parsing data...");
                        let data = JSON.parse(response.content);
                        console.log(data);
                        let versions = new Discord.Collection();
                        data.forEach(instance => {
                            if (versions.has(instance.version.toString())) {
                                versions.set(instance.version.toString(), {version: instance.version, count: (versions.get(instance.version.toString()).count+1)});
                            } else {
                                versions.set(instance.version.toString(), {version: instance.version, count: 1});
                            }
                        });
                        let versionString = "";
                        versions.forEach(version => {
                            versionString += `\n${version.version}: ${version.count} - ${(version.count/data.length*100).toFixed(2)}%`;
                        });

                        let serverCount = 0;
                        let serverGames = new Discord.Collection();
                        let playerCount = 0;
                        let playerGames = new Discord.Collection();
                        let gamemodes = new Discord.Collection();
                        let maps = new Discord.Collection();

                        data.forEach(instance => {
                            instance.servers.forEach(server => {
                                serverCount++;
                                if (serverGames.has(server.game)) {
                                    serverGames.set(server.game, {game: server.game, count: (serverGames.get(server.game).count+1)});
                                } else {
                                    serverGames.set(server.game, {game: server.game, count: 1});
                                }

                                if (gamemodes.has(server.gametype)) {
                                    gamemodes.set(server.gametype, {
                                        gametype: server.gametype, 
                                        count: (gamemodes.get(server.gametype).count+1),
                                        players: (gamemodes.get(server.gametype).players+server.clientnum)
                                    });
                                } else {
                                    gamemodes.set(server.gametype, {
                                        gametype: server.gametype, 
                                        count: 1,
                                        players: server.clientnum
                                    });
                                }

                                if (maps.has(server.map)) {
                                    maps.set(server.map, {
                                        mapname: server.map,
                                        count: (maps.get(server.map).count+1),
                                        players: (maps.get(server.map).players+server.clientnum)
                                    });
                                } else {
                                    maps.set(server.map, {
                                        mapname: server.map,
                                        count: 1,
                                        players: server.clientnum
                                    });
                                }

                                if (server.clientnum > 0) {
                                    playerCount += server.clientnum;
                                    if (playerGames.has(server.game)) {
                                        playerGames.set(server.game, {game: server.game, count: (playerGames.get(server.game).count += server.clientnum)});
                                    } else {
                                        playerGames.set(server.game, {game: server.game, count: server.clientnum});
                                    }
                                }
                            });
                        });


                        let serverString = "";
                        serverGames.forEach(server => {
                            serverString += `\n${server.game}: ${server.count} - ${(server.count/serverCount*100).toFixed(2)}%`;
                        });

                        let playerString = "";
                        playerGames.forEach(game => {
                            playerString += `\n${game.game}: ${game.count} - ${(game.count/playerCount*100).toFixed(2)}%`;
                        });

                        let gamemodeString = "";
                        let gamemodeStatsString = "";
                        gamemodes.forEach(gamemode => {
                            gamemodeString += `\n${gamemode.gametype}: ${gamemode.count} - ${(gamemode.count/serverCount*100).toFixed(2)}%`;
                            gamemodeStatsString += `\n${gamemode.gametype}: ${gamemode.players} - ${(gamemode.players/playerCount*100).toFixed(2)}%`;
                        });

                        let topFiveMaps = [null, null, null, null, null];
                        for (let i = 0; i < 5; i++) {
                            maps.forEach(map => {
                                if (topFiveMaps[i] == null || topFiveMaps[i].players < map.players) {
                                    topFiveMaps[i] = map;
                                    maps.delete(map.mapname);
                                }
                            });
                        }

                        let mapString = "";
                        let mapStatsString = "";
                        topFiveMaps.forEach(map => {
                            mapString += `\n${map.mapname}: ${map.count} - ${(map.count/serverCount*100).toFixed(2)}%`;
                            mapStatsString += `\n${map.mapname}: ${map.players} - ${(map.players/playerCount*100).toFixed(2)}%`;
                        });


                        let embed = new Discord.RichEmbed().setTitle("IW4MAdmin Stats")
                        .addField("API Info", `Instances: ${data.length}\n\nInstance Versions:${versionString}`, true)
                        .addField("\u200B", `Servers: ${serverCount}\n\nServer Games:${serverString}`, true)
                        .addField("\u200B", `Players: ${playerCount}\n\nPlayer Games:${playerString}`, true)
                        .addField("\u200B", `Server Gametypes: ${gamemodeString}`, true)
                        .addField("\u200B", `Gametype Players: ${gamemodeStatsString}`, true)
                        .addBlankField(true)
                        .addField("\u200B", `Server Maps: ${mapString}`, true)
                        .addField("\u200B", `Map Players: ${mapStatsString}`, true)
                        .addBlankField(true)
                        .addField("\u200B", `Info requested by ${m.author.tag}`)
                        .setFooter("Only the Top 5 populated maps are displayed.")
                        .setTimestamp();
                        return msg.edit("Done!", {embed});
                    });
                });
                break;
            }
            case "meme": {
                if (m.channel.id != "260768564489748480" && m.channel.id != "419968973287981061") {
                    return m.channel.send("Can't do that here fam, try in <#260768564489748480>.").then(msg => {
                        msg.delete(7500);
                    });
                }
                let memes = fs.readdirSync("./data/iw4x_memes");
                let memesButNoFileExtensions = [];
                for (let i = 0; i < memes.length; i++) {
                    memesButNoFileExtensions[i] = memes[i].split(".")[0];
                }
                let args = m.content.slice(2);



                switch (args[0]) {
                    case "random": {
                        return m.channel.send("Here's your meme fam", {files: ["./data/iw4x_memes/"+memes[Math.floor(Math.random()*(memes.length+1))]]});
                    }
                    case undefined:
                    case null: {
                        let amountPerList = Math.ceil(memes.length / 3);
                        let lists = ["", "", ""];
                        

                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < amountPerList; j++) {
                                if (!memes[j]) break;
                                lists[i] += "\n" + memes[j];
                            }
                            memes = memes.slice(amountPerList);
                        }

                        let embed = new Discord.RichEmbed().setTitle("File Browser")
                        .setDescription("Use `@IW4x Bot#3006 meme <filename>` to open a file.\nUse `@IW4x Bot#3006 meme random` to get a random meme.")
                        .addField("Files", lists[0], true)
                        .addField("\u200B", lists[1], true)
                        .addField("\u200B", lists[2], true)
                        .setTimestamp();

                        return m.channel.send(embed);
                    }
                    default: {
                        if (!memes.includes(args[0]) && !memesButNoFileExtensions.includes(args[0])) {
                            return m.channel.send("Don't have that meme fam :frowning:");
                        }

                        if (memesButNoFileExtensions.includes(args[0])) {
                            args[0] = memes[memesButNoFileExtensions.indexOf(args[0])];
                        }
                        return m.channel.send("Here's your meme fam", {files: ["./data/iw4x_memes/"+args[0]]});
                    }
                }
            }
        }
    }

    if (m.content[0] == "!help") {
        switch(m.content[1]) {
            case "commands": return m.channel.send({embed:self.embeds.commands});
            case "topics": return m.channel.send({embed:self.embeds.topics});
            default: return m.channel.send("```\n!help commands ..... List available commands\n!help topics ....... List available support topics\n```");
        }
    }
});

self.on("guildMemberAdd", member => {
    if (member.user.username.toLowerCase().includes("pop")) return member.kick();

    if (member.guild.id != "219514629703860235") return;
    if (new Date().getUTCDay() != self.today) {
        self.today = new Date().getUTCDay();
        self.joins[new Date().getUTCDay()-1] = 0;
    }
    self.joins[new Date().getUTCDay()-1]++;
    fs.writeFileSync("./data/joins.json",JSON.stringify(self.joins,"",1),"utf8");
    if (self.mutes.includes(member.id)) {
        member.addRole("269959459349069824","Was previously muted");
        return member.user.send(self.embeds.muted).then(() => {
            self.channels.get("442888565177712640").send({embed:{title:"User joined",fields:[{name:"Status",value:"Muted\nMessage Received"},{name:"Tag",value:member.user.tag},{name:"ID",value:member.id}]}})
        }).catch(e => {
            self.channels.get("442888565177712640").send({embed:{title:"User joined",fields:[{name:"Status",value:"Muted\nMessage Not Received"},{name:"Tag",value:member.user.tag},{name:"ID",value:member.id}]}})
        });
    } else {
        return member.user.send(self.embeds.welcome).then(() => {
            self.channels.get("442888565177712640").send({embed:{title:"User joined",fields:[{name:"Status",value:"Not Muted\nMessage Received"},{name:"Tag",value:member.user.tag},{name:"ID",value:member.id}]}})
        }).catch(e => {
            self.channels.get("442888565177712640").send({embed:{title:"User joined",fields:[{name:"Status",value:"Not Muted\nMessage Not Received"},{name:"Tag",value:member.user.tag},{name:"ID",value:member.id}]}})
        });
    }
});

self.on("guildMemberUpdate",(oM,nM) => {
    if (nM.roles.has("269959459349069824") && !oM.roles.has("269959459349069824") && !self.mutes.includes(nM.id)) { // if they were muted
        self.mutes.push(nM.id);
        return fs.writeFileSync("./data/mutes.json",JSON.stringify(self.mutes,"",1),"utf8");
    } else if (!nM.roles.has("269959459349069824") && oM.roles.has("269959459349069824")) { // if they were unmuted
        self.mutes.splice(self.mutes.indexOf(nM.id),1);
        return fs.writeFileSync("./data/mutes.json",JSON.stringify(self.mutes,"",1),"utf8");
    } else return;
});

process.on("uncaughtException", err => {
	console.error(err.stack);
    self.channels.get("419968973287981061").send(`<@211227683466641408> Crashed: ${err}\n at ${new Date().toString()}\nCheck console for more info.`);
    process.exit();
});

function parseUptime(uptime) {
	let days = 0,hours = 0,minutes = 0,seconds = Math.round(uptime);
	while ((seconds - 60) > 1) {seconds -= 60;minutes++;}
	while ((minutes - 60) > 1) {minutes -= 60;hours++;}
	while ((hours - 24) > 1) {hours -= 24;days++;}
	if (days == 0) {if (hours == 0) {if (minutes == 0) {return `${seconds} Seconds`} else {return `${minutes} Minutes, ${seconds} Seconds`}} else {return `${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`}} else {return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`}
}

function parseUsage(usage) {
    let size = ["B","KB","MB","GB"],usageData = 0;
    while (usage/1024 >= 1) {usage = usage/1024;usageData++}
    return parseInt(usage)+size[usageData];
}

function toBool(data) {
    if (data > 0) {return "Yes"} else {return "No"}
}

function getFFType (data) {
    switch(data) {
        case 0: return "Disabled";
        case 1: return "Enabled";
        case 2: return "Reflected";
        case 3: return "Shared";
        default: return "Disabled";
    }
}

function loadingBar(total, current) {
    if (current % 5 == 0) {
        let percentage = current/total*100,percentageTemp = current/total*100,bar = [];
        while (percentageTemp > 10) {bar.push("▓");percentageTemp -= 10}
        while (bar.length != 10) {bar.push("░")}
        return {bool:true,percentage:percentage.toFixed(2),bar: bar.join("")};
    }
    return {bool:false,percentage: null,bar: null};
}

function fetchMutes() {
    self.guilds.get("219514629703860235").members.forEach(m => {
        if (m.roles.has("269959459349069824")) return self.mutes.push(m.id);
    });
    setTimeout(() => {fs.writeFileSync("./data/mutes.json",JSON.stringify(self.mutes,"",1),"utf8");},10000);
}

init();