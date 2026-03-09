const fs = require("fs");
module.exports.config = {
  name: "gm",
    version: "2.1.1",
  hasPermssion: 0,
  credits: "PRINCE RAJPUT", 
  description: "Just Respond",
  commandCategory: "no prefix",
    cooldowns: 5, 
};

module.exports.handleEvent = async ({ api, event, Users, Currencies, args, utils, client, global }) => {
  var name = await Users.getNameUser(event.senderID);
  var { threadID, messageID } = event;
  let react = event.body.toLowerCase();
  if(react.includes("gm") ||
     react.includes("Gm") ||
     react.includes("Morning") ||
react.includes("morning")) {
    var msg = {
        body: `★━━━━━━━━━━━━━★😍𝐔𝐭𝐡𝐣𝐚𝐨 𝐊𝐮𝐦𝐛𝐡𝐤𝐚𝐫𝐚𝐧 𝐊𝗶 𝗮𝘂𝗹𝗮𝗱𝗼𝗼😒😍★━━━━━━━━━━━━━★`,attachment: fs.createReadStream(__dirname + `/noprefix/gmm.jpg`)
      }
      api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😈", event.messageID, (err) => {}, true)
    }
  }
  module.exports.run = async ({ api, event, Currencies, args, utils, client, global }) => {

  }
