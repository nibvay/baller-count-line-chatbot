/* eslint-disable operator-linebreak */

const { CHANNEL_ACCESS_TOKEN } = process.env;
async function getUserProfile({ groupId, userId }) {
  const userProfile = await fetch(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` },
  }).then((response) => response.json());
  return userProfile;
}

function validMsgTime(timestamp) {
  console.log({ timestamp });
  const date = new Date(timestamp);

  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  // valid time range: Friday 20:00:00 ~ Tuesday 22:00:00
  return (
    (dayOfWeek === 5 && hour >= 20) || // after Friday 20:00
    dayOfWeek === 6 || // Saturday
    dayOfWeek === 0 || // Sunday
    dayOfWeek === 1 || // Monday
    (dayOfWeek === 2 && hour < 22) // before TuesDay 22:00
  );
}

function validKeyword(msg) {
  const pureMsg = msg.trim();
  return (
    pureMsg.slice(0, 3) === "零打+" ||
    pureMsg === "0+" ||
    pureMsg.slice(0, 3) === "零打-" ||
    pureMsg === "自己-1" ||
    pureMsg === "clear all" ||
    pureMsg === "當周"
  );
}

async function getCurrentResult(leave, alternate) {
  const leaveList = leave.length > 0 ? leave.split("+") : [];
  const alternateList = alternate.length > 0 ? alternate.split("+") : [];
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
  return { altList, pendingList };
}

module.exports = {
  getUserProfile,
  validMsgTime,
  validKeyword,
  getCurrentResult,
};
