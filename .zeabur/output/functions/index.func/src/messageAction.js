function addAlternate({ msg, displayName, alternate }) {
  const playCount = msg.slice(0, 2) === "0+" ? parseInt(msg[2], 10) : parseInt(msg[3], 10);
  if (playCount === 0)
    throw new Error("\u8ACB\u518D\u6B21\u78BA\u8A8D\u8F38\u5165\u6307\u4EE4");
  let newVal = "";
  if (alternate.length > 0) {
    newVal = `${alternate}+${[...new Array(playCount)].map(() => displayName).join("+")}`;
  } else {
    newVal = `${[...new Array(playCount)].map(() => displayName).join("+")}`;
  }
  return newVal;
}
function minusAlternate({ msg, displayName, alternate }) {
  if (alternate.length === 0)
    throw new Error("\u76EE\u524D\u6C92\u6709\u96F6\u6253\uFF0C\u8ACB\u518D\u6B21\u78BA\u8A8D\u8F38\u5165\u6307\u4EE4");
  let minusCount = msg.slice(0, 2) === "0-" ? parseInt(msg[2], 10) : parseInt(msg[2], 10);
  if (minusCount === 0)
    throw new Error("\u8ACB\u518D\u6B21\u78BA\u8A8D\u8F38\u5165\u6307\u4EE4");
  const newVal = alternate.split("+").filter((name) => {
    if (minusCount === 0)
      return true;
    if (name === displayName) {
      minusCount -= 1;
      return false;
    }
    return true;
  }).join("+");
  return newVal;
}
function makeSelfLeave({ leave, displayName }) {
  let newVal;
  if (leave.length > 0) {
    const findIdx = leave.split("+").findIndex((name) => name === displayName);
    if (findIdx > -1)
      throw new Error("\u60A8\u5DF2\u7D93\u8ACB\u904E\u5047\u4E86\uFF0C\u8ACB\u518D\u6B21\u78BA\u8A8D\u8F38\u5165\u6307\u4EE4");
    newVal = `${leave}+${displayName}`;
  } else {
    newVal = `${displayName}`;
  }
  return newVal;
}
function cancelSelfLeave({ leave, displayName }) {
  let newVal;
  if (leave.length > 0) {
    const findIdx = leave.split("+").findIndex((name) => name === displayName);
    if (findIdx === -1)
      throw new Error("\u60A8\u4E26\u6C92\u6709\u8ACB\u5047\uFF0C\u8ACB\u518D\u6B21\u78BA\u8A8D\u8F38\u5165\u6307\u4EE4");
    newVal = leave.split("+").filter((name) => name !== displayName).join("+");
  } else {
    newVal = leave;
  }
  return newVal;
}
module.exports = {
  addAlternate,
  minusAlternate,
  makeSelfLeave,
  cancelSelfLeave
};
