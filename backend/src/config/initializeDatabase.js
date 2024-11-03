import { createConnection } from "mysql2/promise";

export async function initializeDatabase() {
  // Initial connection configuration without database and password
  const configWithoutDb = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
  };

  try {
    // Connect to MySQL without specifying a database
    const connection = await createConnection(configWithoutDb);

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS payroll_db`);
    console.log("Database 'payroll_db' checked/created");

    // Switch to the newly created database
    await connection.changeUser({ database: "payroll_db" });

    // Table creation queries
    const tables = [
      `CREATE TABLE IF NOT EXISTS Users (
                user_id INT PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                mobile_number VARCHAR(15),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
      `CREATE TABLE IF NOT EXISTS PayrollLists (
                payroll_list_id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                list_name VARCHAR(100),
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status ENUM('active', 'inactive'),
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )`,
      `CREATE TABLE IF NOT EXISTS JobPositions (
                position_id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(100),
                salary DECIMAL(10, 2)
            )`,
      `CREATE TABLE IF NOT EXISTS Employees (
                employee_id INT PRIMARY KEY AUTO_INCREMENT,
                payroll_list_id INT,
                employee_name VARCHAR(100),
                FOREIGN KEY (payroll_list_id) REFERENCES PayrollLists(payroll_list_id)
            )`,
      `CREATE TABLE IF NOT EXISTS PayrollEntries (
                entry_id INT PRIMARY KEY AUTO_INCREMENT,
                payroll_list_id INT,
                employee_id INT,
                position_id INT,
                FOREIGN KEY (payroll_list_id) REFERENCES PayrollLists(payroll_list_id),
                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
                FOREIGN KEY (position_id) REFERENCES JobPositions(position_id)
            )`,
    ];

    // Execute table creation queries
    for (const query of tables) {
      await connection.query(query);
    }

    console.log("All tables created successfully!");
    await connection.end();
  } catch (error) {
    console.error("Error setting up the database:", error);
  }
}

// Initialize the database
initializeDatabase();