const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function connectDB() {

  return open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

}

async function createTables() {

  const db = await connectDB();

  await db.exec(`
  
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

  `);

  await db.exec(`
  
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      text TEXT,
      completed INTEGER,
      username TEXT
    );

  `);

}

module.exports = {
  connectDB,
  createTables
};