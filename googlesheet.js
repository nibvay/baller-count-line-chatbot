require("dotenv").config();

const { google } = require("googleapis");

const { CLIENT_EMAIL, PRIVATE_KEY, SHEET_ID } = process.env;

// authenticate the service account
const googleAuth = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  PRIVATE_KEY.replace(/\\n/g, "\n"),
  "https://www.googleapis.com/auth/spreadsheets",
);

async function getSheetData() {
  try {
    // google sheet instance
    const sheetInstance = await google.sheets({ version: "v4", auth: googleAuth });
    // read data in the range in a sheet
    const infoObjectFromSheet = await sheetInstance.spreadsheets.values.get({
      auth: googleAuth,
      spreadsheetId: SHEET_ID,
      range: "play!A2:B4",
    });

    const valuesFromSheet = infoObjectFromSheet.data.values;
    return {
      leave: valuesFromSheet[1][1],
      alternate: valuesFromSheet[2][1],
    };
  } catch (err) {
    console.log("readSheet func() error", err);
    throw err;
  }
}

// const { GoogleSpreadsheet } = require("google-spreadsheet");
// const { JWT } = require("google-auth-library");

// const jwt = new JWT({
//   email: process.env.CLIENT_EMAIL,
//   key: process.env.PRIVATE_KEY,
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
// });

// async function getSheetData() {
// const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);
// await doc.loadInfo();

// const sheet = doc.sheetsByIndex[0];
// const rows = await sheet.getRows();

// console.log("item: ", rows[0].get("item"), " value:", rows[0].get("value")); // date
// console.log("item: ", rows[1].get("item"), " value:", rows[1].get("value")); // leave
// console.log("item: ", rows[2].get("item"), " value:", rows[2].get("value")); // alternate
// return {
//   leave: rows[1].get("value"),
//   alternate: rows[2].get("value"),
// };
// }

function updateSheet() {
}

module.exports = {
  getSheetData,
  updateSheet,
};
