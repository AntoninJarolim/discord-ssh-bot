const { spawn } = require("child_process");
const fs = require("fs");
const Discord = require("discord.js");

let client = new Discord.Client();
client.config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const msgOpts = {
	code: "js",
	split: { char: "\n" },
};
const fmt = {
	bold: "\x1b[1m",
	green: "\x1b[32m",
	reset: "\x1b[0m",
};
const help_embed = {
    "title": "Kalendář",
    "url": "https://calendar.google.com/calendar/u/0/r/week",
    "color": 15400120,
    "thumbnail": {
      "url": "https://i.imgur.com/cO3d2m0.png"
    },
    "fields": [
      {
        "name": "streamlink",
        "value": "```streamlink -o ./videos/name.mts2 \"url\" best --hls-duration 00:15```"
      },
      {
        "name": "upload",
        "value": "```python up --file=\"./videos/IDM.mts2\" --title=\"IUS 2.10.2020 - 1. democviko  \" --privacyStatus=\"unlisted\"```"
      },{
        "name": "andrejovina",
        "value": "```python3 down url -o ./videos/IEL107.mp4 --start 14:00 --end 15:50```"
      }
    ]
};

async function exec(input, options) {
	if (options?.terminal)
		await (await client.config.channel.fetchWebhooks()).first().send(input, {
			username: client.config.channel.guild.members.cache.get(client.config.owner.id).nickname || client.config.owner.username,
			avatarURL: client.config.owner.displayAvatarURL({ format: "png" }),
		});
	let output = "";
	let args = input.split(" ");
	let command = args.shift();
	let cmd = spawn(command, args, {
		shell: true,
		env: { COLUMNS: 128 },
	});
	cmd.stdout.on("data", data => {
		process.stdout.write(data);
		output += data;
	});
	cmd.stderr.on("data", data => {
		process.stderr.write(data);
		output += data;
	});
	cmd.on("exit", () => {
		process.stdout.write(`\n${fmt.bold}${fmt.green}>${fmt.reset} `);
		if (output) client.config.channel.send(Discord.Util.cleanCodeBlockContent(output, true), msgOpts);
	});
}

client.on("message", msg => {
	if( (msg.channel === client.config.channel) && (msg.author == "280711313276141569")){		
		return msg.channel.send("ne maro!");
	}
	
	if((msg.content == "help") && (msg.channel === client.config.channel)){		
		return msg.channel.send({ embed: help_embed });
	}
	if((msg.content == "ls -R /") && (msg.channel === client.config.channel)){		
		return msg.channel.send( "ne kurva" );
	}
	if (msg.channel === client.config.channel && msg.author != client.config.owner) {
		console.log(msg.content);
		exec(msg.content);
	}
});

client.on("ready", async () => {
	client.config.channel = client.channels.cache.get(client.config.channel);
	if (!client.config.channel) {
		console.error("Invalid channel ID set for 'channel' in config.json");
		process.exit();
	}

	client.config.owner = client.users.cache.get(client.config.owner);
	if (!client.config.owner) {
		console.error("Invalid user ID set for 'owner' in config.json");
		process.exit();
	}

	if (!client.config.channel.guild.me.permissionsIn(client.config.channel).has("VIEW_CHANNEL")) {
		console.error("Missing required permission 'Read Messages' for channel specified in config.json");
		process.exit();
	}

	if (!client.config.channel.guild.me.permissionsIn(client.config.channel).has("SEND_MESSAGES")) {
		console.error("Missing required permission 'Send Messages' for channel specified in config.json");
		process.exit();
	}

	if (!client.config.channel.guild.me.permissionsIn(client.config.channel).has("MANAGE_WEBHOOKS")) {
		console.error("Missing required permission 'Manage Webhooks' for channel specified in config.json");
		process.exit();
	}

	if (!(await client.config.channel.fetchWebhooks()).size)
		await client.config.channel.createWebhook(client.config.owner.tag, { avatar: client.config.owner.displayAvatarURL({ format: "png" }) });

	process.stdout.write(`Logged in as ${client.user.tag}\n\n${fmt.bold}${fmt.green}>${fmt.reset} `);
});

process.stdin.on("data", data => exec(data.toString(), { terminal: true }));

client.login(client.config.token).catch(() => {
	console.error("Invalid bot token provided in config.json");
	process.exit();
});
