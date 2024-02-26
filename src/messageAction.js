function addAlternate({ msg, displayName, alternate }) {
  const playCount = msg === "0+" ? parseInt(msg[2], 10) : parseInt(msg[3], 10);
  if (playCount === 0) return null;
  let newVal = "";
  if (alternate.length > 0) {
    newVal = `${alternate}+${[...new Array(playCount)].map(() => displayName).join("+")}`;
  } else {
    newVal = `${[...new Array(playCount)].map(() => displayName).join("+")}`;
  }
  return newVal;
}

function minusAlternate({ msg, displayName, alternate }) {
  if (alternate.length === 0) throw new Error("There is no alternate now.");
  let minusCount = parseInt(msg[3], 10);
  if (minusCount === 0) return null;
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

function minusSelf({ leave, displayName }) {
  let newVal;
  if (leave.length > 0) {
    if (!leave.split("+").findIndex((name) => name === displayName)) newVal = `${leave}+${displayName}`;
  } else {
    newVal = `${displayName}`;
  }
  return newVal;
}

module.exports = {
  addAlternate,
  minusAlternate,
  minusSelf,
};
