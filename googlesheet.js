require("dotenv").config();

// const { GoogleSpreadsheet } = require("google-spreadsheet");
// const { JWT } = require("google-auth-library");

// const jwt = new JWT({
//   email: process.env.CLIENT_EMAIL,
//   key: process.env.PRIVATE_KEY,
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
// });

async function getSheetData() {
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
}

function updateSheet() {
}

module.exports = {
  getSheetData,
  updateSheet,
};
