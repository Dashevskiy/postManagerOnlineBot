const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/database.json');

// Загрузка данных из файла
function loadData() {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

// Сохранение данных в файл
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { loadData, saveData };
