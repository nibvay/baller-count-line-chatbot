function addAlternate({ msg, displayName, alternate }) {
  const playCount = msg.slice(0, 2) === "0+" ? parseInt(msg[2], 10) : parseInt(msg[3], 10);
  if (playCount === 0) throw new Error("請再次確認輸入指令");
  let newVal = "";
  if (alternate.length > 0) {
    newVal = `${alternate}+${[...new Array(playCount)].map(() => displayName).join("+")}`;
  } else {
    newVal = `${[...new Array(playCount)].map(() => displayName).join("+")}`;
  }
  return newVal;
}

function minusAlternate({ msg, displayName, alternate }) {
  if (alternate.length === 0) throw new Error("目前沒有零打，請再次確認輸入指令");
  let minusCount = msg.slice(0, 2) === "0-" ? parseInt(msg[2], 10) : parseInt(msg[2], 10);
  if (minusCount === 0) throw new Error("請再次確認輸入指令");
  const newVal = alternate
    .split("+")
    .filter((name) => {
      if (minusCount === 0) return true;
      if (name === displayName) {
        minusCount -= 1;
        return false;
      }
      return true;
    })
    .join("+");
  return newVal;
}

function makeSelfLeave({ leave, displayName }) {
  let newVal;
  if (leave.length > 0) {
    const findIdx = leave.split("+").findIndex((name) => name === displayName);
    if (findIdx > -1) throw new Error("您已經請過假了，請再次確認輸入指令");
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
    if (findIdx === -1) throw new Error("您並沒有請假，請再次確認輸入指令");
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
  cancelSelfLeave,
};
