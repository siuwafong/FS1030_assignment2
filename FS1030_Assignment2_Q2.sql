CREATE DATABASE customer_support;
USE customer_support;

CREATE TABLE tickets (
	ticket_no INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	acquired_time DATETIME,
    est_support_time DATETIME,
    ticket_status VARCHAR(100),
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES customers(customer_id) 
    );

CREATE TABLE ticket_details (
	message TEXT,
    cust_id INT NOT NULL,
    FOREIGN KEY (cust_id) REFERENCES customers(customer_id)
    );

INSERT INTO ticket_details (cust_id, message) VALUES
	(1, "Please help me"),
    (2, "I need urgent help"),
    (3, "I need a refund"),
    (4, "I have a complaint");

SELECT * FROM ticket_details;

DROP TABLE tickets;

INSERT INTO tickets (acquired_time, est_support_time, ticket_status, created_by) VALUES
	(NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', 1),
    (NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', 2),
    (NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', 3),
    (NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', 4);


SELECT * FROM tickets;
DESC tickets;

SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i:%s %p, %W, %d %M %Y'), DATE_FORMAT(est_support_time, '%H:%i:%s %p, %d %M %Y'), ticket_status
AS ticket_no, acquired_time, est_support_time, ticket_status FROM tickets;

CREATE TABLE staff (
	staff_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    staff_lname VARCHAR(100) NOT NULL,
    staff_fname VARCHAR(100) NOT NULL,
    pword VARCHAR(100) NOT NULL
    );


INSERT INTO staff (staff_lname, staff_fname, pword) VALUES
	('Sharma', 'Tarun', 1234),
    ('Palmer', 'Matt', 1234),
    ('Trejo', 'Ramses', 1234),
    ('UXGuy', 'Robin', 1234);

SELECT * FROM staff;

SELECT * FROM staff WHERE staff_lname = "Sharma" AND pword = 1234;

DROP TABLE staff;

CREATE TABLE customers (
	customer_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    customer_lname VARCHAR(100),
    customer_fname VARCHAR(100),
    pword VARCHAR(100) NOT NULL
    );

SELECT * FROM customers WHERE customer_lname = "Fong" AND pword = 1234;

DROP TABLE customers;
DESC customers;
SELECT * FROM customers;

    
INSERT INTO customers (customer_lname, customer_fname, pword) VALUES
	('Fong', 'Wilson', 1234),
    ('Mann', 'Simarjit', 1234),
    ('Gonzalez', 'Daniel', 1234),
    ('Beaury', 'Sebastien', 1234);


SELECT ticket_status FROM TICKETS WHERE ticket_no = 4;

SELECT CONCAT(customer_fname, ' ', customer_lname) AS full_name, customer_id from customers WHERE customer_id = 1;

