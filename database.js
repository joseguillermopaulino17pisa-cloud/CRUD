const fs = require("fs");

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync("db.json"));
  } catch {
    return { users: [], tasks: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };