require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const { readSheetData, updateSheet } = require("./src/googlesheet");
const { getUserProfile, validMsgTime, validKeyword, organizeResult } = require("./src/utilities");
const { addAlternate, minusAlternate, makeSelfLeave, cancelSelfLeave } = require("./src/messageAction");
const { pendingQ } = require("./src/pendingQueue");
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});
const port = process.env.PORT || 3e3;
const app = express();
app.get("/", (req, res) => {
  res.send("check!");
});
app.post("/callback", line.middleware(config), async (req, res) => {
  console.log("POST /callback");
  pendingQ.enqueue({ req, res });
  if (!pendingQ.isWorking) {
    await pendingQ.processPendingRequest(execute);
  }
});
async function execute({ req, res, event }) {
  try {
    await handleEvent(event);
  } catch (e) {
    console.error("cause an error", e);
    res.status(500).end();
  }
}
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text")
    return Promise.resolve(null);
  try {
    const msgText = event.message.text.toLocaleLowerCase();
    if (!validKeyword(msgText))
      return null;
    const { groupId, userId } = event.source;
    const { leave, alternate } = await readSheetData();
    console.log("start", { msgText, leave, alternate, time: event.timestamp });
    const { displayName } = await getUserProfile({ groupId, userId });
    const { isKeywords, newLeave, newAlternate } = await handleMessage({
      leave,
      alternate,
      msg: msgText,
      displayName
    });
    if (!isKeywords)
      return null;
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: "text",
        text: organizeResult({ alternate: newAlternate, leave: newLeave })
      }]
    });
  } catch (e) {
    console.error("[Error]", e);
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: "text",
        text: `${e}`
      }]
    });
  }
}
async function handleMessage({ leave, alternate, msg, displayName }) {
  if (msg.slice(0, 3) === "\u96F6\u6253+" || msg.slice(0, 2) === "0+") {
    const newVal = addAlternate({ msg, displayName, alternate });
    await updateSheet("alternate", newVal);
    return {
      isKeywords: true,
      newLeave: leave,
      newAlternate: newVal
    };
  }
  if (msg.slice(0, 3) === "\u96F6\u6253-" || msg.slice(0, 2) === "0-") {
    const newVal = minusAlternate({ msg, displayName, alternate });
    await updateSheet("alternate", newVal);
    return {
      isKeywords: true,
      newLeave: leave,
      newAlternate: newVal
    };
  }
  if (msg === "\u8ACB\u5047") {
    const newVal = makeSelfLeave({ leave, displayName });
    await updateSheet("leave", newVal);
    return {
      isKeywords: true,
      newLeave: newVal,
      newAlternate: alternate
    };
  }
  if (msg === "\u53D6\u6D88\u8ACB\u5047") {
    const newVal = cancelSelfLeave({ leave, displayName });
    await updateSheet("leave", newVal);
    return {
      isKeywords: true,
      newLeave: newVal,
      newAlternate: alternate
    };
  }
  if (msg === "clear all" || msg === "clear") {
    await updateSheet("clearAll", null);
    return {
      isKeywords: true,
      newLeave: "",
      newAlternate: ""
    };
  }
  if (msg === "\u7576\u5468") {
    return {
      isKeywords: true,
      newLeave: leave,
      newAlternate: alternate
    };
  }
  return {
    isKeywords: false,
    newLeave: leave,
    newAlternate: alternate
  };
}
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
module.exports = app;
