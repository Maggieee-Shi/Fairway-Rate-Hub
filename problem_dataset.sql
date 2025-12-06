-- Make sure we are in the right schema
USE SqlMasterClass;

------------------------------------------------------------
-- Problem 1: Find Duplicate Emails
-- Table: Person(id, email)
------------------------------------------------------------
DROP TABLE IF EXISTS Person;

CREATE TABLE Person (
    id    INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

INSERT INTO Person (id, email) VALUES
    (1, 'a@example.com'),
    (2, 'b@example.com'),
    (3, 'c@example.com'),
    (4, 'a@example.com'),
    (5, 'd@example.com'),
    (6, 'b@example.com');

------------------------------------------------------------
-- Problems 2, 3, 7 share a single Employee table + Department
-- Problem 2: Second Highest Salary
-- Problem 3: Department Top Three Salaries
-- Problem 7: Employee + Manager (self join)
--
-- We create one superset Employee table that has all needed columns:
--   id, name, salary, departmentId, employee_id, manager_id
------------------------------------------------------------
DROP TABLE IF EXISTS Department;
DROP TABLE IF EXISTS Employee;

CREATE TABLE Department (
    id   INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Employee (
    id           INT PRIMARY KEY,
    name         VARCHAR(255),
    salary       INT,
    departmentId INT,
    employee_id  INT,
    manager_id   INT
);

-- Departments
INSERT INTO Department (id, name) VALUES
    (1, 'Engineering'),
    (2, 'HR');

-- Employees
-- For problems 2 & 3: id, name, salary, departmentId
-- For problem 7: employee_id, manager_id (we mirror id into employee_id)
INSERT INTO Employee (id, name, salary, departmentId, employee_id, manager_id) VALUES
    (1, 'Alice', 100000, 1, 1, NULL),   -- Eng manager
    (2, 'Bob',    90000, 1, 2, 1),      -- reports to Alice
    (3, 'Carol',  90000, 1, 3, 1),      -- reports to Alice
    (4, 'Dan',    80000, 1, 4, 2),      -- reports to Bob
    (5, 'Eve',    70000, 2, 5, NULL),   -- HR manager
    (6, 'Frank',  65000, 2, 6, 5),      -- reports to Eve
    (7, 'Grace',  60000, 2, 7, 5);      -- reports to Eve

-- Distinct salaries: 100000, 90000, 80000, 70000, 65000, 60000
-- Second highest salary (problem 2) = 90000.

------------------------------------------------------------
-- Problem 4: Consecutive Numbers
-- Table: Logs(id, num)
------------------------------------------------------------
DROP TABLE IF EXISTS Logs;

CREATE TABLE Logs (
    id  INT PRIMARY KEY,
    num INT NOT NULL
);

INSERT INTO Logs (id, num) VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (4, 2),
    (5, 2),
    (6, 3),
    (7, 3),
    (8, 3),
    (9, 2);

------------------------------------------------------------
-- Problem 5: Rank Scores
-- Table: Scores(id, score)
------------------------------------------------------------
DROP TABLE IF EXISTS Scores;

CREATE TABLE Scores (
    id    INT PRIMARY KEY,
    score INT NOT NULL
);

INSERT INTO Scores (id, score) VALUES
    (1, 100),
    (2, 90),
    (3, 90),
    (4, 80),
    (5, 75),
    (6, 60);

------------------------------------------------------------
-- Problem 6: Customer Revenue Analysis
-- Problem 9: Join Three Tables to compute order value per customer
--
-- Shared tables: Orders, OrderItems
--   For problem 6:
--     Customers(customerId, name)
--     Orders(orderId, customerId, orderDate)
--     OrderItems(orderItemId, orderId, amount)
--   For problem 9:
--     Customer(id, name)
--     Orders(id, customerId)
--     OrderItems(id, orderId, price, quantity)
--
-- We make Orders and OrderItems a superset so both problem statements work.
------------------------------------------------------------
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Customer;

-- Problem 6 table
CREATE TABLE Customers (
    customerId INT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL
);

-- Problem 9 table
CREATE TABLE Customer (
    id   INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Shared Orders table (superset of both schemas)
CREATE TABLE Orders (
    id        INT PRIMARY KEY,   -- used by Problem 9
    orderId   INT,               -- used by Problem 6
    customerId INT,
    orderDate DATE NULL
);

-- Shared OrderItems table (superset)
CREATE TABLE OrderItems (
    id          INT PRIMARY KEY,   -- used by Problem 9
    orderItemId INT,               -- used by Problem 6
    orderId     INT,
    amount      DECIMAL(10,2),     -- used by Problem 6
    price       DECIMAL(10,2),     -- used by Problem 9
    quantity    INT
);

-- Data for Customers (problem 6)
INSERT INTO Customers (customerId, name) VALUES
    (1, 'ACME Corp'),
    (2, 'Globex Inc.');

-- Data for Customer (problem 9)
INSERT INTO Customer (id, name) VALUES
    (1, 'John Doe'),
    (2, 'Jane Smith'),
    (3, 'Bob Brown');

-- Orders:
--  101–103 used naturally with Customers (problem 6)
--  201–203 used naturally with Customer (problem 9)
INSERT INTO Orders (id, orderId, customerId, orderDate) VALUES
    (101, 101, 1, '2025-01-10'),   -- ACME / John
    (102, 102, 1, '2025-01-12'),   -- ACME / John
    (103, 103, 2, '2025-01-15'),   -- Globex / Jane

    (201, 201, 1, '2025-02-01'),   -- John
    (202, 202, 2, '2025-02-03'),   -- Jane
    (203, 203, 3, '2025-02-05');   -- Bob

-- OrderItems: keep amount = price * quantity so both
-- problem 6 (sum amount) and problem 9 (sum price*quantity) agree.
INSERT INTO OrderItems (id, orderItemId, orderId, amount, price, quantity) VALUES
    (1001, 1001, 101, 100.00, 50.00, 2),
    (1002, 1002, 102,  60.00, 30.00, 2),
    (1003, 1003, 103,  75.00, 25.00, 3),
    (1004, 1004, 201,  40.00, 20.00, 2),
    (1005, 1005, 202,  90.00, 30.00, 3),
    (1006, 1006, 203,  45.00, 15.00, 3);

------------------------------------------------------------
-- Problem 8: Monthly Sales Trends
-- Table: Sales(id, month, amount)
------------------------------------------------------------
DROP TABLE IF EXISTS Sales;

CREATE TABLE Sales (
    id     INT PRIMARY KEY,
    month  DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL
);

INSERT INTO Sales (id, month, amount) VALUES
    (1, '2025-01-01', 1000.00),
    (2, '2025-02-01', 1200.00),
    (3, '2025-03-01',  900.00),
    (4, '2025-04-01', 1500.00),
    (5, '2025-05-01', 1500.00);

------------------------------------------------------------
-- Problem 10: Running Total of Transactions
-- Table: Transactions(id, amount, transactionDate)
------------------------------------------------------------
DROP TABLE IF EXISTS Transactions;

CREATE TABLE Transactions (
    id              INT PRIMARY KEY,
    amount          DECIMAL(10,2) NOT NULL,
    transactionDate DATE NOT NULL
);

INSERT INTO Transactions (id, amount, transactionDate) VALUES
    (1,  50.00, '2025-01-01'),
    (2, 100.00, '2025-01-02'),
    (3,  75.00, '2025-01-03'),
    (4, 200.00, '2025-01-05'),
    (5, 150.00, '2025-01-06');
