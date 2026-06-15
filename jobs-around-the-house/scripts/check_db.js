const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "dev.db");
console.log("Checking DB at:", dbPath);

try {
    const db = new Database(dbPath, { readonly: true });
    
    // List all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tables in database:", tables.map(t => t.name));
    
    // Check categories columns
    if (tables.some(t => t.name === "categories")) {
        const info = db.prepare("PRAGMA table_info(categories)").all();
        console.log("\nColumns in 'categories' table:");
        console.dir(info);
        const rows = db.prepare("SELECT * FROM categories LIMIT 10").all();
        console.log("\nRecords in 'categories' table:");
        console.dir(rows);
    } else {
        console.log("\n'categories' table does NOT exist!");
    }

    // Check products columns
    if (tables.some(t => t.name === "products")) {
        const info = db.prepare("PRAGMA table_info(products)").all();
        console.log("\nColumns in 'products' table:");
        console.dir(info);
        const rows = db.prepare("SELECT * FROM products LIMIT 5").all();
        console.log("\nRecords in 'products' table:");
        console.dir(rows);
    } else {
        console.log("\n'products' table does NOT exist!");
    }
} catch (err) {
    console.error("Error reading database:", err);
}
