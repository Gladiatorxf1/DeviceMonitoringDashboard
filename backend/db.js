const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // ← use your MySQL password if any (default in XAMPP is empty)
  database: "device_monitoring",
});

module.exports = pool.promise();
