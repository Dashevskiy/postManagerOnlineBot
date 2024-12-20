const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/database.json');

function getData() {
  if (fs.existsSync(dataFile)) {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  return {};
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { getData, saveData };
