/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require("dotenv").config();

const line = require("@line/bot-sdk");
const express = require("express");
const { readSheetData, updateSheet, clearAll } = require("./googlesheet");
const { getUserProfile, validMsgTime, validKeyword, getCurrentResult } = require("./utilities");
const { addAlternate, minusAlternate, minusSelf } = require("./messageAction");
const { pendingQ } = require("./pendingQueue");

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
app.post("/callback", line.middleware(config), async (req, res) => {
  console.log("inin callback");
  pendingQ.enqueue({ req, res });
  if (!pendingQ.isWorking) {
    await pendingQ.processPendingRequest(execute);
  }
});

async function execute({ req, res, event }) {
  try {
    const result = await handleEvent(event);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
}

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") return Promise.resolve(null);
  // if (!validMsgTime(event.timestamp)) return null;
  const msgText = event.message.text.toLocaleLowerCase();
  if (!validKeyword(msgText)) return null;

  const { groupId, userId } = event.source;
  const { leave, alternate } = await readSheetData(); // leave請假, alternate候補
  console.log("start", { msgText, leave, alternate, time: event.timestamp });
  const { displayName } = await getUserProfile({ groupId, userId });
  const isKeywords = await handleMessage({
    leave,
    alternate,
    msg: msgText,
    displayName,
  });
  if (!isKeywords) return null;
  const { leave: newLeave, alternate: newAlternate } = await readSheetData();
  const { altList, pendingList } = await getCurrentResult(newLeave, newAlternate);
  const replyText = `零打: ${altList.join(", ")}\n候補: ${pendingList.join(", ")}\n請假: ${newLeave}`;
  const echo = { type: "text", text: replyText };
  console.log("done", { time: event.timestamp });
  return lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

async function handleMessage({ leave, alternate, msg, displayName }) {
  if (msg.slice(0, 3) === "零打+" || msg === "0+") {
    const newVal = addAlternate({ msg, displayName, alternate });
    if (newVal) await updateSheet("alternate", newVal);
    return true;
  }
  if (msg.slice(0, 3) === "零打-") {
    const newVal = minusAlternate({ msg, displayName, alternate });
    if (newVal) await updateSheet("alternate", newVal);
    return true;
  }
  if (msg === "自己-1") {
    const newVal = minusSelf({ leave, displayName });
    if (newVal) await updateSheet("leave", newVal);
    return true;
  }
  if (msg === "clear all" || msg === "clear") {
    await clearAll();
    return true;
  }
  if (msg === "當周") {
    return true;
  }
  return false;
}

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
