// lib/connect.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "192.168.38.156",
  user: "mysql",
  password: "mysql",
  database: "thoitrang",
});

export default pool;
