const wr = require("web-request"), fs = require("fs"), Server = require("./module/server.js"), Discord = require("discord.js");
const self = new Discord.Client({
    messageCacheMaxSize: 5,
    messageCacheLifetime: 30,
    messageSweepInterval: 600,
    disableEveryone: true,
    sync: false,
    disabledEvents: [
        "GUILD_SYNC",
        "GUILD_MEMBER_ADD",
        "GUILD_MEMBER_REMOVE",
        "GUILD_MEMBER_UPDATE",
        "GUILD_MEMBERS_CHUNK",
        "GUILD_ROLE_CREATE",
        "GUILD_ROLE_DELETE",
        "GUILD_ROLE_UPDATE",
        "GUILD_BAN_ADD",
        "GUILD_BAN_REMOVE",
        "CHANNEL_PINS_UPDATE",
        "MESSAGE_DELETE",
        "MESSAGE_UPDATE",
        "MESSAGE_DELETE_BULK",
        "MESSAGE_REACTION_ADD",
        "MESSAGE_REACTION_REMOVE",
        "MESSAGE_REACTION_REMOVE_ALL",
        "USER_UPDATE",
        "USER_NOTE_UPDATE",
        "USER_SETTINGS_UPDATE",
        "PRESENCE_UPDATE",
        "VOICE_STATE_UPDATE",
        "TYPING_START",
        "VOICE_SERVER_UPDATE",
        "RELATIONSHIP_ADD",
        "RELATIONSHIP_REMOVE"
    ]
});

function randomPresence() {
    let num = Math.floor(Math.random()*(self.memes.length+1));
    self.user.setActivity(self.memes[num]);
    setTimeout(function() {randomPresence()},1800000);
}

function addServer(ip, name) {
    let port = ip.split(":")[1];
    ip = ip.split(":")[0];
    if (self.servers.has(ip)) return;
    self.servers.set(`${ip}:${port}`,new Server({ip, port, name}));
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
    self.embeds = require("./data/embeds.json");
    self.servers = new Discord.Collection();
    let servers = require("./data/servers.json");
    for (let i in servers) {
        self.servers.set(`${servers[i].ip}:${servers[i].port}`, new Server(servers[i]));
    }
    self.memes = ["IW4x Support","Type your problem into #support!","IW4x v0.5.4","Call of Duty: Modern Warfare 2","Spacewar","Not a neural network!","Updated frequently!","Tech Support","Indian Tech Support",":flag_au:","+set net_port <28960>","help cant create iw4play account 😦", "fatal error","👀","/dev/console","BotWarfare","24/7 Terminal","zombie warfare 2 by santahunter","iMeme","#nsfw-meme-philosophy is my favourite channel","Rocket V2 was better","🚀🇻2","Running on german engineering!","Plutekno5xplayv2delta1revolution","with 300 ungrateful indian pirates","MW2:R","closed source ☹️","Advanced BotWarfare"];
    self.login(self.config.token);
}

self.on("ready", () => {
    randomPresence();
    self.channels.get("292040520648228864").send({embed: new Discord.RichEmbed().setTitle(`IW4x Bot`).addField("Status",self.user.presence.status,true).addField("Version","v0.5.4",true).addField("Guilds",self.guilds.size,true).addField("RAM Usage",`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`,true).setColor(self.guilds.get("292040520648228864").me.displayHexColor).setThumbnail(self.user.displayAvatarURL)});   
});

self.on("message", m => {
    if (m.author == self.user || m.channel.type == "dm") return;
    m.content = m.content.toLowerCase().split(" ");
    if (m.channel.type == "text" && self.config.allowedChannels.includes(m.channel.id) && !m.content[0].startsWith("!") && m.content[0] != "<@394079419964063744>") {
        if (m.content.includes("vac")) return m.channel.send({embed:self.embeds.vac})
        if (parseKeywords(m.content,["download","get","free"]) && parseKeywords(m.content,["dlc","dlcs"])) return m.channel.send({embed:self.embeds.dlc});
        if (parseKeywords(m.content,["download","get","free","install"]) && (parseKeywords(m.content,["mw2","modern warfare","modern warfare 2"]))) return m.channel.send({embed:self.embeds.game});
        if (parseKeywords(m.content,["download","get","free","install"]) && parseKeywords(m.content,["iw4x","iw4"])) return m.channel.send({embed:self.embeds.iw4x});
        if (parseKeywords(m.content,["no","all","find","any","few","low"]) && parseKeywords(m.content,["server","servers"])) return m.channel.send({embed:self.embeds.servers});
        if (m.content.includes("fatal") && m.content.includes("error")) return m.channel.send({embed:self.embeds.fatal});
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
                        return addServer(ip,server.sv_hostname.replace(/\^[0-9:;c]/g, ""));
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
                                addServer(ip,JSON.parse(response.content).status.sv_hostname.replace(/\^[0-9:;c]/g, ""));
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
    if (member.guild.id != "219514629703860235") return;
	return member.user.send(self.embeds.welcome).then(() => {
        self.channels.get("394080767396937731").send({embed:{title:"Member joined",fields:[{name:"Tag",value:member.user.tag},{name:"Received welcome message?",value:"Yes"}]}});
    }).catch(e => {
        self.channels.get("394080767396937731").send({embed:{title:"Member joined",fields:[{name:"Tag",value:member.user.tag},{name:"Received welcome message?",value:`No\n${e}`}]}});
    });
});

process.on("uncaughtException", err => {
	console.error(err.stack);
    self.channels.get("292040520648228864").send(`<@211227683466641408> Crashed: ${err}\n at ${new Date().toString()}\nCheck console for more info.`);
    console.error(err);
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

init();