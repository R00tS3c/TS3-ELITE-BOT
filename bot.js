const express = require("express");
const app = express();
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
const { get } = require("snekfetch");
const portscanner = require('portscanner');
const htmlparser2 = require("htmlparser2");


//Podesavanja
const host                = "ts3.elitegaming.me";
const port                = 9987;
const queryport           = 10011;
const username            = "serveradmin";
const password            = "2k5cvhRtc6pSDk";
const botname             = "UGB.RS BOT";

const debug               = false;  //DEBUG LOG
const error               = false;  //ERROR LOG
const info                = true;   //INFO LOG

const TryReconnect        = true;
const WelcomeMsg          = true;
const StaffOnline         = true;
const UsersOnline         = true;
const NotifyStaffHelp     = true;

const botprefix           = "-";
const OnlineChannelID     = 153;
const StaffChannelID      = 7;
const HelpChannelID       = 20;
const StaffGroups         = ["55", "36"];
const NotifyHelp          = ["45"];

const SteamAPI            = "521186ABF3F9902433A9F7BFBC7BFC72";
const ClashOfClansAPI     = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkwMDE5NzdhLThlYjAtNDdjNy05MDQ0LTA3YzNjM2I0ODhkMiIsImlhdCI6MTYwOTYyNDY1MCwic3ViIjoiZGV2ZWxvcGVyLzZhYmQ1N2EyLTZmZGQtZDU1YS1kMjBjLTFkYzQ1NzE0NzRkNSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjM0LjIzOS4xMjguMTc3Il0sInR5cGUiOiJjbGllbnQifV19.vyHJtyrZ2TWShdyXZNmoLID9dtVDLgftrMQFSRShDLLH9ODUeE7aAJu4l3aYdWsjOOF8ukSWuFCJIJcaWqnpwA";
const FortniteTrackerAPI  = "124bcb91-f1ed-4021-9209-1ade04568f3a";

const teamspeak = new TeamSpeak({
  host: host,
  queryport: queryport,
  serverport: port,
  username: username,
  password: password,
  nickname: botname
})

teamspeak.on("ready", async function() {
  
   await log("BOT USPESNO POVEZAN NA TS3!", 2);
  
   if(UsersOnline == true || StaffOnline == true) {
    updateOnline(OnlineChannelID, StaffChannelID);
   }
  
   newsMessage();
  
   setInterval(function() {
    updateOnline(OnlineChannelID, StaffChannelID);
   }, 60000);

   setInterval(function() {
    newsMessage();
   }, 600000);
});

teamspeak.on("clientmoved", async function(data) {
if(data.channel.propcache.cid==HelpChannelID && NotifyStaffHelp==true) {
  await SendStaffMSG(data.client.propcache.clientNickname);
}
});


teamspeak.on("clientconnect", async (client) => {
  if(WelcomeMsg==true) {
  sendWelcome(client);
  }
});

/*teamspeak.on("clientconnect", async (client) => {
  if(WelcomeMsg==true) {
  await sendWelcome(client);
  }
  
  if(UsersOnline==true || StaffOnline ==true) {
    updateOnline(OnlineChannelID, StaffChannelID);
  }
});

teamspeak.on("clientdisconnect", async () => {
  
  if(UsersOnline==true || StaffOnline == true) {
    updateOnline(OnlineChannelID, StaffChannelID);
  }
});*/
    
teamspeak.on("close", async () => {
    if(TryReconnect==true)
    await log("RECONNECT: Pokusavam da se povezem na TS3...", 2)
    await teamspeak.reconnect(-1, 1000)
    await log("RECONNECT: Uspešno!", 2)
});


teamspeak.on("error", async (error) => {
  await log(error, 1);
});

async function log(msg, type) {
  if(debug==true && type==0) {
    await console.log("DEBUG: " + msg)
  } else if (error==true && type==1) {
    await console.log("ERROR: " + msg)
  } else if (info==true && type==2) {
    await console.log("INFO: " + msg)
  }
};

async function sendWelcome(client) {
  await teamspeak.sendTextMessage(client.client.clid, 1,
    `\n\n    Welcome ` + client.client.propcache.clientNickname + `\n` + 
    `    Your first connection was on [b]`+new Date(client.client.propcache.clientCreated * 1000)+`[/b].
    Your last connection was on [b]`+ new Date(client.client.propcache.clientLastconnected * 1000) + `[/b].
    Your unique id is [b]"`+ client.client.propcache.clientUniqueIdentifier +`"[/b].
    Your client version is [b]`+ client.client.propcache.clientVersion +` (`+ client.client.propcache.clientPlatform+`)[/b].
    Your ip adress is [b]`+ client.client.propcache.connectionClientIp +` (`+ client.client.propcache.clientCountry +`)[/b].\n
    If you have any questions/remarks/suggestions/compliments join in [b]"Need Help?"[/b] channel and wait for administrator.
    
    Register on our forum: [url=https://forum.elitegaming.me]LINK[/url]
    For list commands: ${botprefix}help`)
  .catch(e => {
     log(e, 1);
  });
};

async function SendStaffMSG(username) {
  const clients = await teamspeak.clientList();
  const clientsfilter = await clients.filter(client => NotifyHelp.some(g => client.servergroups.includes(g)));
  clientsfilter.forEach(client => {
    client.message("Potrebna je pomoć korisniku [b]"+username+"[/b] !")
  });
};

async function updateOnline(channelid=false, staffchannelid=false) {
  const clients = await teamspeak.clientList();
  const count = await clients.filter(client => StaffGroups.some(g => client.servergroups.includes(g)));
  const TotalClients = clients.length;
  const TotalStaff = count.length;
  if(channelid!=false) {
     var totalreplace = "[cspacer]ONLINE: "+TotalClients;
     await teamspeak.channelInfo(channelid).then(currentname => {
      if(currentname.channelName!=totalreplace) {
             teamspeak.channelEdit(channelid, {channelName: totalreplace});
      }
    });
  }
  if(staffchannelid!=false) {
  var staffreplace = "[cspacer]STAFF ONLINE: "+TotalStaff;
  await teamspeak.channelInfo(staffchannelid).then(currentname => {
        if(currentname.channelName!=staffreplace) {
            teamspeak.channelEdit(staffchannelid, {channelName: staffreplace});
        }
    }); 
  }
};


teamspeak.on("textmessage", async message => {
  if(!message.msg.startsWith(botprefix)) return;
  const args = message.msg.slice(botprefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if(commandName=="slots") {
    await slots(args[0], message.invoker.clid);
  } else if(commandName=="8ball") {
    await ball(args, message.invoker.clid);
  } else if(commandName=="rps") {
    await rps(args[0], message.invoker.clid);
  } else if(commandName=="csgo") {
    await csgo(args[0], message.invoker.clid);
  } else if(commandName=="coc") {
    await coc(args[0], message.invoker.clid);
  } else if(commandName=="fortnite") {
    await fortnite(args[0], args[1], message.invoker.clid);
  } else if(commandName=="help") {
    await help(message.invoker.clid);
  } else if(commandName=="portscan") {
    await portscan(args[0], message.invoker.clid);
  }  else {
    await teamspeak.sendTextMessage(message.invoker.clid, 1, "Command not found! Use "+ botprefix + "help for list commands!"); 
  }
});

async function help(username) {
      await teamspeak.sendTextMessage(username, 1, `\nHere is list of available commands: \n
  ❯ ${botprefix}8ball
  ❯ ${botprefix}slots
  ❯ ${botprefix}rps
  ❯ ${botprefix}csgo
  ❯ ${botprefix}coc
  ❯ ${botprefix}fortnite
      `); 
};

async function portscan(host, user) {
    if (typeof host === 'undefined') { 
        await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}portscan 127.0.0.1`);
        return;
    }
    
    await portscanner.findAPortInUse(1, 10000, host, async (error,port) => {
        await teamspeak.sendTextMessage(user, 1, "Port open: "+ port+ "\n");
        if(error) {
        log(error, 1);
        }
    });
};

async function fortnite(username, platform, user) {
   if (typeof username === 'undefined' || typeof platform === 'undefined') { 
     await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}fortnite username platform`);
     return;
   }
     
  const data = await get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username)}`)
            .set("TRN-Api-Key", FortniteTrackerAPI)
            .catch(e => {
                log(e,1)
            });


                await teamspeak.sendTextMessage(user, 1, `❯ **Epic Username:** ${data.body.epicUserHandle}` + "\n"
               + `❯ Score:** ${data.body.lifeTimeStats.find(a => a.key === "Score") ? data.body.lifeTimeStats.find(a => a.key === "Score").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Matches Played:** ${data.body.lifeTimeStats.find(a => a.key === "Matches Played") ? data.body.lifeTimeStats.find(a => a.key === "Matches Played").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Kills:** ${data.body.lifeTimeStats.find(a => a.key === "Kills") ? data.body.lifeTimeStats.find(a => a.key === "Kills").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Wins: ${data.body.lifeTimeStats.find(a => a.key === "Wins") ? data.body.lifeTimeStats.find(a => a.key === "Wins").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ K/D:** ${data.body.lifeTimeStats.find(a => a.key === "K/d") ? data.body.lifeTimeStats.find(a => a.key === "K/d").value : "N/A"}`+ "\n"
               + `❯ Top 3s:** ${data.body.lifeTimeStats.find(a => a.key === "Top 3s") ? data.body.lifeTimeStats.find(a => a.key === "Top 3s").value.toLocaleString() : "N/A"}`+ "\n"
               + `❯ Platform:** ${data.body.platformNameLong}`);
};

async function newsMessage() {
    const ugbfeed = await get(`https://ugb.rs/feed/`)
    .catch(e => {
        log(e,1);
    });
  
    const feed = await htmlparser2.parseFeed(ugbfeed.body);
  
    var item = Math.floor(Math.random() * feed.items.length);
    teamspeak.sendTextMessage("0", 3, "[b][color=red][NOVOSTI][/color][/b] Novi članak [url="+feed.items[item].link+"]"+feed.items[item].title+"[/url] na našem sajtu! Možete pročitati klikom na naslov!")
};

async function csgo(username, user) {
   if (typeof username === 'undefined') { 
     await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}csgo username`);
     return;
   }
        const userData = await get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`)
            .query({ key: SteamAPI, vanityurl: username })
            .catch(e => {
                log(e,1);
            });

        const steamID = userData.body.response.steamid;

        const userStats = await get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/`)
            .query({ key: SteamAPI, appid: 730, steamid: steamID })
            .catch(e => {
                log(e,1);
            });

        const { stats } = userStats.body.playerstats;
  
           await teamspeak.sendTextMessage(user, 1, "\n❯ Steam Username: " + username + "\n"
           + "❯ KDR: " + (stats ? stats.find(a => a.name === "total_kills").value / stats.find(a => a.name === "total_deaths").value : 0).toFixed(2) + "\n"
           + "❯ Total Kills: " + `${stats.find(a => a.name === "total_kills") ? stats.find(a => a.name === "total_kills").value.toLocaleString() : 0}` + "\n"
           + "❯ Total Deaths: " + `${stats.find(a => a.name === "total_deaths") ? stats.find(a => a.name === "total_deaths").value.toLocaleString() : 0}` + "\n"
           + "❯ Total Wins: " +  `${stats.find(a => a.name === "total_wins") ? stats.find(a => a.name === "total_wins").value.toLocaleString() : 0}` + "\n"
           + "❯ Total MVPs: " + `${stats.find(a => a.name === "total_mvps") ? stats.find(a => a.name === "total_mvps").value.toLocaleString() : 0}` + "\n"
           + "❯ Time Played (Not Idle): " + `${stats ? (stats.find(a => a.name === "total_time_played").value / 60 / 60).toFixed(2) : 0} Hour(s)` + "\n"
           + "❯ Knife Kills: " + `${stats.find(a => a.name === "total_kills_knife") ? stats.find(a => a.name === "total_kills_knife").value.toLocaleString() : 0}`);
};

async function coc(tag, user) {
     if (typeof tag === 'undefined') { 
      await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}coc tag`);
      return;
     }
          const data = await get(`https://api.clashofclans.com/v1/players/${encodeURIComponent(tag.toUpperCase().replace(/O/g, "0"))}`)
            .set({ Accept: "application/json", Authorization: ClashOfClansAPI })
            .catch(error => {
                log(error, 1)
            });

        const playerData = data.body;


        await teamspeak.sendTextMessage(user, 1, "\n❯ League: " + `${playerData.league ? playerData.league.name : "N/A"}` + "\n"
            + "❯ Trophies: " + `${playerData.trophies}` + "\n"
            + "❯ War Stars: " + `${playerData.warStars}` + "\n"
            + "❯ Best Trophies: " + `${playerData.bestTrophies}` + "\n");
  
        let troopLevels = "", spellLevels = "", heroLevels = "";

        playerData.troops.forEach(troop => troopLevels += `${troop.name}: ${troop.level} ${troop.level === troop.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (troopLevels) await teamspeak.sendTextMessage(user, 1, "❯ Troop Levels: " + troopLevels);

        playerData.spells.forEach(spell => spellLevels += `${spell.name}: ${spell.level} ${spell.level === spell.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (spellLevels) await teamspeak.sendTextMessage(user, 1, "❯ Spell Levels: "+ spellLevels);

        playerData.heroes.forEach(hero => heroLevels += `${hero.name}: ${hero.level} ${hero.level === hero.maxLevel ? "🔥\n" : "\n"}`); // eslint-disable-line
        if (heroLevels) await teamspeak.sendTextMessage(user, 1, "❯ Hero Levels: " + heroLevels);
};

async function rps(move, user) {
     if (typeof move === 'undefined') { 
          await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}rps rock/paper/scissors`);
          return;
     }
        const choices = ["rock", "paper", "scissors"];

        const outcome = await choices[Math.floor(Math.random() * choices.length)];
        const choice = move.toLowerCase();
        if (choice === "rock") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! That's a tie!");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! I win, you loose!");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "Scissors! No! You won...");
        } else if (choice === "paper") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! No! You won...");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! Yeah! That's a tie!");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "***Scissors! I win, you loose!");
        } else if (choice === "scissors") {
            if (outcome === "rock") return teamspeak.sendTextMessage(user, 1, "Rock! I win, you loose!");
            if (outcome === "paper") return teamspeak.sendTextMessage(user, 1, "Paper! No! You won...");
            if (outcome === "scissors") return teamspeak.sendTextMessage(user, 1, "***Scissors! Yeah! That's a tie!");
        } else {
             await teamspeak.sendTextMessage(user, 1, "Wrong argument you can use: rock, paper, scissors!");
        }
};

async function ball(question, user) {
     if (typeof question[0] === 'undefined') { 
       await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}8ball question`);
       return;
     }
  
  const answers = [
    "Maybe.", "Certainly not.", "I hope so.", "Not in your wildest dreams.",
    "There is a good chance.", "Quite likely.", "I think so.",
    "I hope not.", "I hope so.", "Never!", "Fuhgeddaboudit.",
    "Ahaha! Really?!?", "Pfft.", "Sorry, bucko.",
    "Hell, yes.", "Hell to the no.", "The future is bleak.",
    "The future is uncertain.", "I would rather not say.", "Who cares?",
    "Possibly.", "Never, ever, ever.", "There is a small chance.", "Yes!"];
  
   await teamspeak.sendTextMessage(user, 1, `🎱 ${answers[Math.floor(Math.random() * answers.length)]}`)
};

async function slots(bet, user) {
     if (typeof bet === 'undefined') { 
      await teamspeak.sendTextMessage(user, 1, `Please use this command in this format: ${botprefix}slots 50`);
      return;
     }
  
    const slots = ["🍔", "🍟", "🌭", "🍕", "🌮", "🍘", "🍫", "🍿", "🍩"];
    const Mone = slots[Math.floor(Math.random() * slots.length)];
    const Mtwo = slots[Math.floor(Math.random() * slots.length)];
    const Mthree = slots[Math.floor(Math.random() * slots.length)];
    const Tone = slots[Math.floor(Math.random() * slots.length)];
    const Ttwo = slots[Math.floor(Math.random() * slots.length)];
    const Tthree = slots[Math.floor(Math.random() * slots.length)];
    const Bone = slots[Math.floor(Math.random() * slots.length)];
    const Btwo = slots[Math.floor(Math.random() * slots.length)];
    const Bthree = slots[Math.floor(Math.random() * slots.length)];
    var Snowflakes = bet;
    if (Mone === Mtwo || Mone === Mthree || Mthree === Mtwo) {
            const flakesPercent = await Math.round(Snowflakes * 60 / 100) >= 1 ? Math.round(Snowflakes * 50 / 100) : 1;
            const coins = 100 + Snowflakes + flakesPercent;
            await teamspeak.sendTextMessage(user, 1, `\n${Tone} | ${Ttwo} | ${Tthree}\n${Mone} | ${Mtwo} | ${Mthree}\n${Bone} | ${Btwo} | ${Bthree}`);
            await teamspeak.sendTextMessage(user, 1, `You won ${coins} coins!`)
            await teamspeak.sendTextMessage(user, 1, `You just won ❄ \`${flakesPercent}\`, you now have ❄ \`${bet}\`! Good job!`);
    } else {
          await teamspeak.sendTextMessage(user, 1, `\n${Tone} | ${Ttwo} | ${Tthree}\n${Mone} | ${Mtwo} | ${Mthree}\n${Bone} | ${Btwo} | ${Bthree}`);
          await teamspeak.sendTextMessage(user, 1, `You lost ❄ \`${Snowflakes}\`, you now have ❄ \`${bet}\`! Better luck next time!`);
    }
};

app.get("/api", (request, response) => {
});


const listener = app.listen(process.env.PORT, () => {
  log(botname+" API ONLINE NA PORTU: " + listener.address().port, 2);
});
