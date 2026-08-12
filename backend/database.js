const Database = require("better-sqlite3");

const db = new Database("nadigo.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        orderID TEXT UNIQUE,

        name TEXT,

        phone TEXT,

        address TEXT,

        service TEXT,

        weight REAL,

        price TEXT,

        pickupDate TEXT,

        status TEXT

    )
`).run();

console.log("NadiGo Database Ready");

// =========================
// DATABASE MIGRATION
// =========================

try {

    db.prepare(`
        ALTER TABLE orders
        ADD COLUMN actualWeight REAL
    `).run();

    console.log("actualWeight column added");

}
catch(error) {

    if (!error.message.includes("duplicate column name")) {
        console.log(error);
    }

}


try {

    db.prepare(`
        ALTER TABLE orders
        ADD COLUMN actualPrice TEXT
    `).run();

    console.log("actualPrice column added");

}
catch(error) {

    if (!error.message.includes("duplicate column name")) {
        console.log(error);
    }

}

module.exports = db;