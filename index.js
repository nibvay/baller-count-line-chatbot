require("dotenv").config();

const line = require("@line/bot-sdk");
const express = require("express");
const { readSheetData } = require("./googlesheet");
const { getUserProfile } = require("./utilities");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const port = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("check!");
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") return Promise.resolve(null);

  const { leave, alternate } = await readSheetData(); // leave請假, alternate候補

  // handleMessage({ leave, alternate, msg: event.message.text });
  const { groupId, userId } = event.source;
  // const replyText = `my reply: ${event.message.text}`;
  // create an echoing text message
  const { displayName } = await getUserProfile({ groupId, userId });
  const replyText = `hi ${displayName}, my reply: ${event.message.text}\nleave: ${leave}\nalternate: ${alternate}`;
  const echo = { type: "text", text: replyText };

  // use reply API
  return lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

// function handleMessage({ leave, alternate, msg }) {
//   if (msg.slice(0, 3) === '零打+') {
//     const playCount = parseInt(msg[3], 10);
//     const username = getUsername({ lineClient, userId, groupId });

//     let newVal = '';
//     if (alternate.length > 0) {
//       newVal = `${alternate}+${[...new Array(playCount)].map(() => username).join('+')}`
//     } else {
//       newVal = `${[...new Array(playCount)].map(() => username).join('+')}`;
//     }

//     // set value: newVal

//   } else if (msg.slice(0, 3) === '零打-')
// }

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
