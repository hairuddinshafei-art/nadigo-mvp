require("dotenv").config();

const { Pool } = require("pg");

console.log(
    "DATABASE HOST:",
    process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).host
        : "DATABASE_URL TIADA"
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testDatabase() {

    try {

        const result = await pool.query(
            "SELECT NOW()"
        );

        console.log(
            "NadiGo PostgreSQL Connected:",
            result.rows[0]
        );

    }

    catch (error) {

        console.error(
            "POSTGRESQL CONNECTION ERROR:",
            error
        );

    }

}

testDatabase();

module.exports = pool;