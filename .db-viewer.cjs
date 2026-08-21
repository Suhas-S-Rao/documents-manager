const sqlite3 = require('sqlite3').verbose();
const { SqliteGuiNode } = require('sqlite-gui-node');

const db = new sqlite3.Database('C:\\Users\\ADMIN\\AppData\\Roaming\\documents-manager\\data\\documents.db');

SqliteGuiNode(db)
  .then(() => {
    console.log('SQLite GUI: http://localhost:8080/');
  })
  .catch(console.error);
