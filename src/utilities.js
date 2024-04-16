/* eslint-disable operator-linebreak */

const { CHANNEL_ACCESS_TOKEN } = process.env;
async function getUserProfile({ groupId, userId, renameInfo }) {
  const newName = renameInfo
    .split("\n")
    .find((name) => name.split("!")[0] === userId)
    ?.split("!")?.[1];
  if (newName?.length > 0) return newName;

  const userProfile = await fetch(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` },
  }).then((response) => response.json());
  return userProfile.displayName;
}

function validMsgTime(timestamp) {
  const date = new Date(timestamp);

  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  // valid time range: Friday 20:00:00 ~ Tuesday 20:00:00
  return (
    (dayOfWeek === 5 && hour >= 20) || // after Friday 20:00
    dayOfWeek === 6 || // Saturday
    dayOfWeek === 0 || // Sunday
    dayOfWeek === 1 || // Monday
    (dayOfWeek === 2 && hour < 20) // before TuesDay 20:00
  );
}

function validKeyword(msg) {
  const pureMsg = msg.trim();
  return (
    pureMsg.slice(0, 3) === "零打+" ||
    pureMsg.slice(0, 2) === "0+" ||
    pureMsg.slice(0, 3) === "零打-" ||
    pureMsg.slice(0, 2) === "0-" ||
    pureMsg === "請假" ||
    pureMsg === "取消請假" ||
    pureMsg === "clear all" ||
    pureMsg === "clear" ||
    pureMsg === "當周" ||
    pureMsg.slice(0, 2) === "叫我"
  );
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
  const altMap = new Map();
  altList.forEach((name) => {
    altMap.set(name, altMap.has(name) ? altMap.get(name) + 1 : 1);
  });
  const altResult = [...altMap].map(([name, count]) => `${name}${count > 1 ? count : ""}`);

  const pendingMap = new Map();
  pendingList.forEach((name) => {
    pendingMap.set(name, pendingMap.has(name) ? pendingMap.get(name) + 1 : 1);
  });
  const pendingResult = [...pendingMap].map(([name, count]) => `${name}${count > 1 ? count : ""}`);

  return `零打: ${altResult.join(", ")}\n候補: ${pendingResult.join(", ")}\n請假: ${leaveList.join(", ")}${lookingFor > 0 ? `\n\n缺${lookingFor}位` : ""}`;
}

module.exports = {
  getUserProfile,
  validMsgTime,
  validKeyword,
  organizeResult,
};
