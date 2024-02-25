require("dotenv").config();

const line = require("@line/bot-sdk");
const express = require("express");
const { readSheetData, updateSheet } = require("./googlesheet");
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

  const { groupId, userId } = event.source;
  const { leave, alternate } = await readSheetData(); // leave請假, alternate候補
  const { displayName } = await getUserProfile({ groupId, userId });
  console.log({ leave, alternate, displayName });

  await handleMessage({
    leave, alternate, msg: event.message.text, displayName,
  });

  const { leave: newLeave, alternate: newAlternate } = await readSheetData();
  getCurrentResult({ leave: newLeave, alternate: newAlternate });
  // const replyText = `my reply: ${event.message.text}`;
  // create an echoing text message
  const replyText = `hi ${displayName}, my reply: ${event.message.text}\nleave: ${newLeave}\nalternate: ${newAlternate}`;
  const echo = { type: "text", text: replyText };

  // use reply API
  return lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

async function handleMessage({
  leave, alternate, msg, displayName,
}) {
  if (msg.slice(0, 3) === "零打+") {
    const playCount = parseInt(msg[3], 10);

    let newVal = "";
    if (alternate.length > 0) {
      newVal = `${alternate}+${[...new Array(playCount)].map(() => displayName).join("+")}`;
    } else {
      newVal = `${[...new Array(playCount)].map(() => displayName).join("+")}`;
    }
    await updateSheet("alternate", newVal);
  } else if (msg.slice(0, 3) === "零打-") {
    let minusCount = parseInt(msg[3], 10);
    if (minusCount === 0) return;
    if (alternate.length > 0) {
      const newVal = alternate.split("+").filter((name) => {
        if (minusCount === 0) return true;
        if (name === displayName) {
          minusCount -= 1;
          return false;
        }
        return true;
      }).join("+");
      await updateSheet("alternate", newVal);
    }
  } else if (msg === "自己-1") {
    let newVal;
    if (leave.length > 0) {
      if (!leave.split("+").findIndex((name) => name === displayName)) newVal = `${leave}+${displayName}`;
    } else {
      newVal = `${displayName}`;
    }

    await updateSheet("leave", newVal);
  }
}

function getCurrentResult({ leave, alternate }) {

}

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
