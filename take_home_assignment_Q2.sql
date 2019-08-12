CREATE DATABASE customer_support;
USE customer_support;

CREATE TABLE tickets (
	ticket_no INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	acquired_time TIMESTAMP,
    est_support_time DATETIME,
    ticket_status VARCHAR(100)
    );

INSERT INTO tickets (acquired_time, est_support_time, ticket_status) VALUES
	(CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 MINUTE), 'active');

SELECT * FROM tickets;

CREATE TABLE staff (
	staff_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    staff_lname VARCHAR(100),
    staff_fname VARCHAR(100)
    );

INSERT INTO staff (staff_lname, staff_fname) VALUES
	('Sharma', 'Tarun'),
    ('Palmer', 'Matt'),
    ('Trejo', 'Ramses'),
    ('UXGuy', 'Robin');

SELECT * FROM staff;

CREATE TABLE customers (
	customer_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    customer_lname VARCHAR(100),
    customer_fname VARCHAR(100),
    current_ticket INT UNIQUE KEY,
    FOREIGN KEY customers(current_ticket) REFERENCES tickets(ticket_no)
    );

DROP TABLE customers;
DESC customers;
SELECT * FROM customers;
    
INSERT INTO customers (customer_lname, customer_fname, current_ticket) VALUES
	('Fong', 'Wilson', 1),
    ('Mann', 'Simarjit', 2),
    ('Gonzalez', 'Daniel', 3),
    ('Beaury', 'Sebastien', 4);


UPDATE customers SET
	current_ticket = 7
WHERE customer_lname = 'Mann';