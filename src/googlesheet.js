require("dotenv").config();

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const jwt = new JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // https://stackoverflow.com/questions/74131595/error-error1e08010cdecoder-routinesunsupported-with-google-auth-library
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function readSheetData() {
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells("A1:B5");

  return {
    leave: sheet.getCell(2, 1).value ?? "",
    alternate: sheet.getCell(3, 1).value ?? "",
    renameInfo: sheet.getCell(4, 1).value ?? "",
  };
}

async function updateSheet(action, newValue) {
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells("A1:B5");

  if (action === "leave") {
    const leaveCell = sheet.getCell(2, 1);
    leaveCell.value = newValue;
  } else if (action === "alternate") {
    const alternateCell = sheet.getCell(3, 1);
    alternateCell.value = newValue;
  } else if (action === "clearAll") {
    const leaveCell = sheet.getCell(2, 1);
    leaveCell.value = "";
    const alternateCell = sheet.getCell(3, 1);
    alternateCell.value = "";
  } else if (action === "rename") {
    const renameCell = sheet.getCell(4, 1);
    renameCell.value = newValue;
    // TODO: syncName with other field
  }

  await sheet.saveUpdatedCells();
}

module.exports = {
  readSheetData,
  updateSheet,
};
