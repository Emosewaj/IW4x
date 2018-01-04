const wr = require("web-request");
const Discord = require("discord.js");
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

self.login("TOKEN");

function randomPresence() {
    let num = Math.floor(Math.random()*(self.memes.length+1));
    self.user.setGame(self.memes[num]);
    setTimeout(function() {randomPresence()},1800000);
}

self.on("ready", () => {
    self.memes = ["IW4x Support","Type your problem into #support!","IW4x v0.5.4","Call of Duty: Modern Warfare 2","Spacewar","Not a neural network!","Updated frequently!",
    "Tech Support","Indian Tech Support",":flag_au:","+set net_port <28960>","help cant create iw4play account 😦", "fatal error","👀","/dev/console","BotWarfare","24/7 Terminal",
    "zombie warfare 2 by santahunter","iMeme","#nsfw-meme-philosophy is my favourite channel","Rocket V2 was better","🚀🇻2","Running on german engineering!",
    "Plutekno5xplayv2delta1revolution","with 300 ungrateful indian pirates","MW2:R"]
    self.user.setPresence({status: "online", afk: false});
    randomPresence();
    self.channels.get("292040520648228864").send({
        embed: new Discord.RichEmbed().setTitle(`IW4x Bot`)
        .addField("Status",self.user.presence.status,true)
        .addField("Version","v0.5.4",true)
        .addField("Guilds",self.guilds.size,true)
        .addField("RAM Usage",`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`,true)
        .setColor(self.guilds.get("292040520648228864").me.displayHexColor)
        .setThumbnail(self.user.displayAvatarURL)
    });
});

self.on("message", m => {
    if (m.author == self.user) return;

    if (m.channel.type == "dm") return m.channel.send("Instead of DMing me, please use the IW4x <#275267435945263104> channel for support instead! Thank you!");

    if (m.channel.type == "text" && (m.channel.id == "275267435945263104" || m.channel.id == "394080767396937731" || m.channel.id == "317323317638070272")) {
        m.content = m.content.toLowerCase();

        if (m.content.includes("vac")) return m.channel.send("Here's some information regarding VAC:",{
            embed: new Discord.RichEmbed().setTitle("Information regarding Valve Anti Cheat")
            .setDescription("Playing IW4x will not result in a VAC ban on your Steam profile, regardless of it's integration.\n\nIW4x connects to your Steam profile to get your nickname, if Steam is running, and the ingame friendslist. It will also display \"In Mod: IW4x: Modern Warfare 2\" as your status.\n\nLaunch IW4x with the -nosteam parameter to prevent this.")
            .setThumbnail("https://steamuserimages-a.akamaihd.net/ugc/838078703168971505/2E7938BBD22302DEADDEF274402014D886E44925/")
            .setTimestamp()
        });

        if ((m.content.includes("download") || m.content.includes("get") || m.content.includes("free")) && m.content.includes("dlc")) return m.channel.send("You can download the DLCs via the IW4x updater or via one of the following links:",{
            embed: new Discord.RichEmbed().setTitle("Download DLCs")
            .setDescription("Use one of the following links to download the IW4x DLCs:")
            .addField("From the updater:","Open the updater and select `2. Update`, say yes to DLCs!")
            .addField("From the website:","https://iw4xcachep26muba.onion.rip/dlc/")
            .addField("From Google Drive:","https://goo.gl/KDFVh7")
            .setThumbnail("https://iw4xcachep26muba.onion.rip/img/dlc1.jpg")
            .setTimestamp()
        });

        if ((m.content.includes("download") || m.content.includes("install") || m.content.includes("free")) && (m.content.includes("mw2") || m.content.includes("modern warfare 2"))) return m.channel.send("Download Call of Duty: Modern Warfare 2 from any of these sources:", {
            embed: new Discord.RichEmbed().setTitle("Download Modern Warfare 2")
            .setDescription("Use one of the links below to get yourself a copy of MW2")
            .addField("Steam:","http://store.steampowered.com/app/10180/Call_of_Duty_Modern_Warfare_2/")
            .addField("WarZone:","https://downloads.warzone.gg/IW4M/MW2.zip")
            .addField("Google Drive:","https://goo.gl/3H4Wj7")
            .setThumbnail("http://cdn.edgecast.steamstatic.com/steam/apps/10180/header.jpg")
            .setTimestamp()
        });

        if ((m.content.includes("download") || m.content.includes("install") || m.content.includes("get")) && m.content.includes("iw4x")) return m.channel.send("To install IW4x, please follow this guide:",{
            embed: new Discord.RichEmbed().setTitle("How to install IW4x")
            .setDescription("After you’ve downloaded your copy of MW2, the next step is to install IW4x itself. Firstly, download the IW4x updater from the official website.")
            .addField("Read the guide:","https://iw4x.tumblr.com/post/161974206329/install-iw4x")
            .setThumbnail("https://78.media.tumblr.com/5a65649120531a945a6f77cf5d375b5a/tumblr_inline_orr4vdgT6y1v0zol5_500.png")
            .setTimestamp()
        });

        if ((m.content.includes("no") || m.content.includes("all") || (m.content.includes("find") && m.content.includes("any"))) && m.content.includes("server")) return m.channel.send("If you can't see any servers at all, make sure your source is set to Internet and that your filters are off.\nIf you still see no servers, open the ingame console using the tilde key (\\`) and enter `/addnode waliant.pw`! This should provide you with about 115 servers.");

        if ((m.content.includes("few") || m.content.includes("low")) && m.content.includes("server")) return m.channel.send("If you see less than 130-ish servers, follow this guide to get more:", {
            embed: new Discord.RichEmbed().setTitle("Low amount of servers issue")
            .setDescription("This issue is usually caused by your router not being able to handle multiple simultaneous connections, or assumes they are a DDoS attack")
            .addField("Step 1.: Download and replace this file in your root MW2 folder:","https://cdn.discordapp.com/attachments/258287260179496960/335357436506669056/iw4x.dll")
            .addField("Step 2.: Check if more servers appear in the list","The correct amount of servers should be around 130")
            .addField("Step 3.: Still not seeing an optimal amount of servers?","Open the console and start lowering the \"net_serverFrames\" value and refresh the list each time until you see the optimal amount of servers.")
            .setThumbnail("https://www.bjorn3d.com/wp-content/uploads/2013/10/D-Link-DI-604.jpg")
            .setTimestamp()
        });

        if (m.content.includes("fatal") && m.content.includes("error")) return m.channel.send("Please follow this guide to resolve fatal errors on Windows 7:", {
            embed: new Discord.RichEmbed().setTitle("Windows 7: Fatal Error")
            .setDescription("So, you’re one of the many unlucky people to suffer from ~~shitty coding~~ unfortunate incompatability issues, the infamous “*fatal error 0x########*”. This is an issue related to Windows 7 (and the fact that apparently neither devs nor testers use it anymore), the following solutions might help you solve this problem:")
            .addField("Read the guide:","https://iw4x.tumblr.com/post/166171864664/fatal-error")
            .setThumbnail("https://i.imgur.com/rCwPor6.png")
            .setTimestamp()
        });

        if (!(m.content.includes("thank") || m.content.includes("thx")) && m.content.includes("help")) return m.channel.send("Please state your problem! If I cannot help, someone who can will come and reply to you shortly (probably)!");
    }
});

self.on("message", m => {
    if (m.author == self.user) return;

    m.content = m.content.toLowerCase();

    if (m.content.startsWith("<@394079419964063744>")) {
        let cmd = m.content.split(" ")[1];
        switch(cmd) {
            case "uptime": return m.channel.send({embed: new Discord.RichEmbed().addField("Uptime",parseUptime(process.uptime()))});
            case "usage": return m.channel.send({embed: new Discord.RichEmbed().addField("Memory Usage",parseUsage(process.memoryUsage().heapUsed))});
            case "test": {
                if (m.author.id != "211227683466641408") {
                    return m.channel.send({embed: new Discord.RichEmbed().setDescription("Access denied.")});
                }
                let status = [];
                if (m.channel.permissionsFor(m.guild.me).has("VIEW_CHANNEL")) {status.push(true)} else {status.push(false)}
                if (m.channel.permissionsFor(m.guild.me).has("SEND_MESSAGES")) {status.push(true)} else {status.push(false)}
                if (m.channel.permissionsFor(m.guild.me).has("EMBED_LINKS")) {status.push(true)} else {status.push(false)};
                return m.channel.send(`\`${status.join(", ")}\``)
            }
            case "restart": {
                if (m.author.id != "211227683466641408") {
                    return m.channel.send({embed: new Discord.RichEmbed().setDescription("Access denied.")});
                }
                return m.channel.send({embed: new Discord.RichEmbed().setDescription("Restarting...")}).then(() => process.exit(1));
            }
            case "ping": {
                m.reply("attempting to connect...").then(msg => {
                    let ip = m.content.split(" ")[2]
                    if (!ip.includes(":")) {
                        ip = `${ip}:28960`;
                    }
                    console.log(`http://${ip}`);
                    wr.get(`http://${ip}/info`,{timeout:3000}).then(response => {
                        if (response.statusCode != 200) {
                            msg.edit(`There was an error trying to connect to ${ip}!\nCode: ${response.statusCode}\nMessage: ${response.statusMessage}`);
                            return;
                        }
                        let server = JSON.parse(response.content).status;
                        let players = JSON.parse(response.content).players;
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
                        return;
                    }).catch(err => {
                        msg.edit(`There was an error trying to connect to ${ip}!\n${err}`);
                    });
                });
                return;
            }
        }
    }
});

process.on("uncaughtException", err => {
	console.error(err.stack);
    self.channels.get("292040520648228864").send(`<@211227683466641408> Crashed: ${err}\n at ${new Date().toString()}`);
    self.channels.get("292040520648228864").send(`\`\`\`\n${err.stack}\`\`\``).then(()=>{process.exit(1);},()=>{process.exit(1);});
});

function parseUptime(uptime) {
	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = Math.round(uptime);
	
	while ((seconds - 60) > 1) {
		seconds -= 60;
		minutes++;
	}
	while ((minutes - 60) > 1) {
		minutes -= 60;
		hours++;
	}
	while ((hours - 24) > 1) {
		hours -= 24;
		days++;
	}
	
	if (days == 0) {
		if (hours == 0) {
			if (minutes == 0) {
				return `${seconds} Seconds`;
			} else {
				return `${minutes} Minutes, ${seconds} Seconds`;
			}
		} else {
			return `${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;
		}
	} else {
		return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;
	}
}

function parseUsage(usage) {
    let size = ["B","KB","MB","GB"];
    let usageData = 0
    while (usage/1024 >= 1) {
        usage = usage/1024;
        usageData++
    }
    return parseInt(usage)+size[usageData];
}

function toBool(data) {
    if (data > 0) {
        return "Yes";
    }
    return "No";
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
