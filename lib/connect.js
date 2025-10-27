// lib/connect.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "555888",
  database: "thoitrang",
});

export default pool;