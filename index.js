require("dotenv").config();

const line = require("@line/bot-sdk");
const express = require("express");
const { getSheetData } = require("./googlesheet");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
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
  const { leave, alternate } = await getSheetData();

  const replyText = `my reply: ${event.message.text}\nleave: ${leave}\nalternate: ${alternate}`;

  // create an echoing text message
  const echo = { type: "text", text: replyText };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

// function updateSheet({
//   sheet, groupId, userId, userMessage,
// }) {
//   if (userMessage.slice(0, 3) === "零打+") {
//     const playCount = parseInt(userMessage[3], 10);
//     const currentVal = sheet.getRange(ALTERNATE_RANGE).getValue();

//     const username = getUserName({ groupId, userId });

//     let newVal = "";
//     if (currentVal.length > 0) {
//       newVal = `${currentVal}+${[...new Array(playCount)].map(() => username).join("+")}`;
//     } else {
//       newVal = `${[...new Array(playCount)].map(() => username).join("+")}`;
//     }

//     sheet.getRange(ALTERNATE_RANGE).setValue(newVal);
//     return generateCurrentResult();
//   }
//   if (userMessage.slice(0, 3) === "零打-") {
//     let minusCount = parseInt(userMessage[3], 10);
//     const currentVal = sheet.getRange(ALTERNATE_RANGE).getValue();

//     if (currentVal.length > 0) {
//       const targetName = getUserName({ groupId, userId });

//       // consider use userId to filter
//       const newVal = currentVal
//         .split("+")
//         .filter((name) => {
//           if (minusCount === 0) return true;
//           if (targetName === name) {
//             minusCount -= 1;
//             return false;
//           }
//           return true;
//         })
//         .join("+");

//       sheet.getRange(ALTERNATE_RANGE).setValue(newVal);
//       return generateCurrentResult();
//     }
//   } else if (userMessage === "自己-1") {
//     const currentVal = sheet.getRange(LEAVE_RANGE).getValue();
//     let newLeaveVal = "";
//     const username = getUserName({ groupId, userId });
//     if (currentVal.length > 0) {
//       if (currentVal.split("+").findIndex((name) => name === username)) return "You already do 自己-1.";
//       newLeaveVal = `${currentVal}+${username}`;
//     } else {
//       newLeaveVal = `${username}`;
//     }

//     sheet.getRange(LEAVE_RANGE).setValue(newLeaveVal);
//     return generateCurrentResult();
//   } else if (userMessage === "目前狀況") {
//     return generateCurrentResult();
//   }
// }

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
