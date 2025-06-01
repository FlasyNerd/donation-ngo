const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test the connection and create table if not exists
pool.getConnection()
    .then(async connection => {
        console.log('Database connected successfully');
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS donations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    donor_name VARCHAR(255),
                    donor_email VARCHAR(255),
                    donor_phone VARCHAR(20),
                    donation_amount DECIMAL(10, 2),
                    payment_id VARCHAR(255),
                    order_id VARCHAR(255),
                    payment_status VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Donations table checked/created');
        } catch (error) {
            console.error('Error creating donations table:', error);
        }
        connection.release();
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = pool;