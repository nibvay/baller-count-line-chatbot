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
  res.send("check! check!");
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
  // const replyText = `my reply: ${event.message.text}`;
  // create an echoing text message
  const echo = { type: "text", text: replyText };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
