const express = require("express");
const app = express();
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
const { Commander } = require("teamspeak-commander");

//Podesavanja
const host                = "ts3.elitegaming.me";
const port                = 9987;
const queryport           = 10011;
const username            = "serveradmin";
const password            = "LR+hR70b";
const botname             = "ELITE BOT";

const debug               = false;  //DEBUG LOG
const error               = false;  //ERROR LOG
const info                = true;   //INFO LOG
const TryReconnect        = true;
const botprefix           = "-";
const OnlineChannelID     = 58;
const StaffChannelID      = 182;
const StaffGroups         = ["9","2","19"]




const teamspeak = new TeamSpeak({
  host: host,
  queryport: queryport,
  serverport: port,
  username: username,
  password: password,
  nickname: botname
})

const commander = new Commander({ prefix: botprefix });

teamspeak.on("ready", async function() {
   log("BOT USPESNO POVEZAN NA TS3!", 2);
   await LoadBotCommandInstance();
   await updateOnline(OnlineChannelID);
   await updateStaff(StaffChannelID);
})


teamspeak.on("clientconnect", async function(client) {
  await sendWelcome(client);
  await updateOnline(OnlineChannelID);
  await updateStaff(StaffChannelID);
})

teamspeak.on("clientdisconnect", async function() {
  await updateOnline(OnlineChannelID);
  await updateStaff(StaffChannelID);
})

teamspeak.on("close", async () => {
    if(TryReconnect==true)
    log("RECONNECT: Pokusavam da se povezem na TS3...", 2)
    await teamspeak.reconnect(-1, 1000)
    log("RECONNECT: Uspešno!", 2)
})

teamspeak.on("error", (error) => {
  log(error, 1);
})

function log(msg, type) {
  if(debug==true && type==0) {
  console.log("DEBUG: " + msg)
  } else if (error==true && type==1) {
      console.log("ERROR: " + msg)
  } else if (info==true && type==2) {
      console.log("INFO: " + msg)
  }
}

async function sendWelcome(client) {
  await teamspeak.sendTextMessage(client.client.clid, 1,
    `\n\n    Welcome ` + client.client.propcache.clientNickname + `\n` + 
    `    Your first connection was on [b]`+new Date(client.client.propcache.clientCreated * 1000)+`[/b].
    Your last connection was on [b]`+ new Date(client.client.propcache.clientLastconnected * 1000) + `[/b].
    Your unique id is [b]"`+ client.client.propcache.clientUniqueIdentifier +`"[/b].
    Your client version is [b]`+ client.client.propcache.clientVersion +` (`+ client.client.propcache.clientPlatform+`)[/b].
    Your ip adress is [b]`+ client.client.propcache.connectionClientIp +` (`+ client.client.propcache.clientCountry +`)[/b].\n
    If you have any questions/remarks/suggestions/compliments join in [b]"Need Help?"[/b] channel and wait for administrator.`)
  .catch(e => {
      log(e, 1);
  });
};

async function updateOnline(channelid) {
  var i = 0;
  const clients = await teamspeak.clientList({})
  clients.forEach(client => {
  i++;
  })
  var replace = "[cspacer]ONLINE: "+i;
  await teamspeak.channelInfo(channelid).then(currentname => {
  if(currentname.channelName!=replace) {
  teamspeak.channelEdit(channelid, {channelName: replace});
  }
  })
  
};

async function updateStaff(channelid) {
  var i = 0;
  
 /* StaffGroups.forEach(async group => {
      var clients = await teamspeak.clientList({clientServergroups:["9"]})
      await clients.forEach(client => {
      i++;
      })
    
  });*/
  var clients = await teamspeak.clientList({clientServergroups:["9"]}) 
  clients.forEach(client => {
  i++;
  })
  
  clients = await teamspeak.clientList({clientServergroups:["19"]})
  clients.forEach(client => {
  i++;
  })
  
  clients = await teamspeak.clientList({clientServergroups:["30"]})
  clients.forEach(client => {
  i++;
  })
  
  var replace = "[cspacer]STAFF ONLINE: "+i;
  await teamspeak.channelInfo(channelid).then(currentname => {
  if(currentname.channelName!=replace) {
  teamspeak.channelEdit(channelid, {channelName: replace});
  }
  })
  
};

async function LoadBotCommandInstance() {
  await commander.createCommand("hazze").help("cigan").run(event => {
    event.reply(`Cigan`)
  })
  
  commander.addInstance(teamspeak);
  log("Komande uspešno učitane!", 2);
}

app.get("/api", (request, response) => {
});


const listener = app.listen(process.env.PORT || 3000, () => {
  log("ELITE-TS BOT API ONLINE NA PORTU: " + listener.address().port, 2);
});
