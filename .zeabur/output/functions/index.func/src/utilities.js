const { CHANNEL_ACCESS_TOKEN } = process.env;
async function getUserProfile({ groupId, userId }) {
  const userProfile = await fetch(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` }
  }).then((response) => response.json());
  return userProfile;
}
function validMsgTime(timestamp) {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  return dayOfWeek === 5 && hour >= 20 || // after Friday 20:00
  dayOfWeek === 6 || // Saturday
  dayOfWeek === 0 || // Sunday
  dayOfWeek === 1 || // Monday
  dayOfWeek === 2 && hour < 20;
}
function validKeyword(msg) {
  const pureMsg = msg.trim();
  return pureMsg.slice(0, 3) === "\u96F6\u6253+" || pureMsg.slice(0, 2) === "0+" || pureMsg.slice(0, 3) === "\u96F6\u6253-" || pureMsg.slice(0, 2) === "0-" || pureMsg === "\u8ACB\u5047" || pureMsg === "\u53D6\u6D88\u8ACB\u5047" || pureMsg === "clear all" || pureMsg === "clear" || pureMsg === "\u7576\u5468";
}
function organizeResult({ leave, alternate }) {
  console.log("in organizeResult", { leave, alternate });
  const leaveList = leave?.length > 0 ? leave.split("+") : [];
  const alternateList = alternate?.length > 0 ? alternate.split("+") : [];
  const altList = [];
  const pendingList = [];
  let altCounter = 0;
  alternateList.forEach((altName) => {
    if (altCounter < leaveList.length) {
      altList.push(altName);
      altCounter += 1;
    } else {
      pendingList.push(altName);
    }
  });
  const lookingFor = leaveList.length > alternateList.length ? leaveList.length - alternateList.length : 0;
  return prettyMessageText({ altList, pendingList, leaveList, lookingFor });
}
function prettyMessageText({ altList, pendingList, leaveList, lookingFor }) {
  const altMap = /* @__PURE__ */ new Map();
  altList.forEach((name) => {
    altMap.set(name, altMap.has(name) ? altMap.get(name) + 1 : 1);
  });
  const altResult = [...altMap].map(([name, count]) => `${name}${count > 1 ? count : ""}`);
  const pendingMap = /* @__PURE__ */ new Map();
  pendingList.forEach((name) => {
    pendingMap.set(name, pendingMap.has(name) ? pendingMap.get(name) + 1 : 1);
  });
  const pendingResult = [...pendingMap].map(([name, count]) => `${name}${count > 1 ? count : ""}`);
  return `\u96F6\u6253: ${altResult.join(", ")}
\u5019\u88DC: ${pendingResult.join(", ")}
\u8ACB\u5047: ${leaveList.join(", ")}${lookingFor > 0 ? `

\u7F3A${lookingFor}\u4F4D` : ""}`;
}
module.exports = {
  getUserProfile,
  validMsgTime,
  validKeyword,
  organizeResult
};
