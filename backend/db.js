const { Pool } = require("pg");
require("dotenv").config();

//I'll connect to my database here
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
