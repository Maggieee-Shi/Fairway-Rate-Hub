USE SqlMasterClass;

INSERT INTO `User` (User_ID, Email, Name, User_type, Institution, Affiliation, Admin_level) VALUES
(1, 'alice.smith@mit.edu', 'Alice Smith', 'student', 'MIT', 'Computer Science', 0),
(2, 'bob.jones@stanford.edu', 'Bob Jones', 'instructor', 'Stanford', 'Database Systems', 1),
(3, 'charlie.brown@harvard.edu', 'Charlie Brown', 'student', 'Harvard', 'Data Science', 0),
(4, 'diana.prince@berkeley.edu', 'Diana Prince', 'admin', 'UC Berkeley', 'IT Department', 2),
(5, 'eve.wilson@cmu.edu', 'Eve Wilson', 'student', 'Carnegie Mellon', 'Software Engineering', 0),
(6, 'frank.garcia@cornell.edu', 'Frank Garcia', 'instructor', 'Cornell', 'Information Systems', 1),
(7, 'grace.lee@yale.edu', 'Grace Lee', 'student', 'Yale', 'Computer Science', 0),
(8, 'henry.davis@princeton.edu', 'Henry Davis', 'student', 'Princeton', 'Applied Math', 0),
(9, 'iris.martin@columbia.edu', 'Iris Martin', 'instructor', 'Columbia', 'Database Theory', 1),
(10, 'jack.taylor@upenn.edu', 'Jack Taylor', 'student', 'UPenn', 'Information Science', 0),
(11, 'admin@example.com', 'Admin User', '2025-12-05 07:34:18', 'Admin', 'SQL Master Class', 'Administrator', 1, 'pbkdf2_sha256$1000000$vyAyl3sMWnwlEZ4HSxdYFO$8l+mDPYZnP9frvNOYfx+6xlnju9adv90Nqo5sd5gMbo='),
(12, 'student@test.com', 'Test Student', '2025-12-05 07:34:18', 'student', NULL, NULL, 0, 'pbkdf2_sha256$1000000$GWAXu4Bdpa5O3a2Pw3GTZt$Xz55T9LFmGDr/amTeAuCzLaABn8t6G8/aiBJhddsMjE='),
(13, 'instructor@test.com', 'Test Instructor', '2025-12-05 07:34:18', 'Instructor', NULL, NULL, 0, 'pbkdf2_sha256$1000000$l3otkD50vSlNxNNNoPGyxo$OBsB5SYFV4LCv4KnbR0R/mSn5vI1EG0kUePa+3DCxsQ=');

INSERT INTO LeaderboardEntry (User_ID, Rating, Rating_ci_low, Rating_ci_high) VALUES
(1, 1450, 1400, 1500),
(3, 1520, 1470, 1570),
(5, 1380, 1330, 1430),
(7, 1600, 1550, 1650),
(8, 1290, 1240, 1340),
(10, 1510, 1460, 1560),
(2, 1700, 1650, 1750);

INSERT INTO Role (Role_ID, Email, Name) VALUES
(1, 'admin@sqlmaster.com', 'System Administrator'),
(2, 'instructor@sqlmaster.com', 'Course Instructor'),
(3, 'ta@sqlmaster.com', 'Teaching Assistant'),
(4, 'grader@sqlmaster.com', 'Assignment Grader'),
(5, 'moderator@sqlmaster.com', 'Forum Moderator'),
(6, 'content@sqlmaster.com', 'Content Creator'),
(7, 'support@sqlmaster.com', 'Technical Support'),
(8, 'mentor@sqlmaster.com', 'Student Mentor');

INSERT INTO Assigns (Role_ID, User_ID) VALUES
(1, 4),  
(2, 2),  
(2, 6),  
(2, 9),  
(3, 1),  
(3, 7),  
(4, 5),  
(5, 10), 
(6, 2), 
(8, 3);

INSERT INTO Dataset (Dataset_ID, Title) VALUES
(1, 'LeetCode SQL Problems'),
(2, 'HackerRank Database Challenges'),
(3, 'Real-World Business Analytics'),
(4, 'Advanced Query Optimization'),
(5, 'Database Design Patterns'),
(6, 'SQL Interview Preparation'),
(7, 'Data Warehousing Projects');

INSERT INTO DatasetVersion (Dataset_ID, Version_no, Notes) VALUES
(1, 1, 'Initial release with 50 problems'),
(1, 2, 'Added 25 more problems, fixed typos'),
(2, 1, 'Beta version with basic challenges'),
(2, 2, 'Production release with 100 challenges'),
(3, 1, 'Real company data scenarios'),
(4, 1, 'Performance optimization focus'),
(5, 1, 'E-commerce database design'),
(5, 2, 'Added social media platform design'),
(6, 1, 'Top 100 SQL interview questions'),
(7, 1, 'Star schema and snowflake examples');

INSERT INTO Tag (Tag_ID, Name) VALUES
(1, 'SQL Basics'),
(2, 'JOIN Operations'),
(3, 'Aggregation'),
(4, 'Window Functions'),
(5, 'Subqueries'),
(6, 'Performance Optimization'),
(7, 'Data Modeling'),
(8, 'Complex Queries'),
(9, 'String Functions'),
(10, 'Date/Time Operations');

INSERT INTO Problem (Problem_ID, Title, Difficulty, Dataset_ID, Version_no, User_ID) VALUES
(1, 'Find Duplicate Emails', 'easy', 1, 1, 2),
(2, 'Second Highest Salary', 'medium', 1, 1, 2),
(3, 'Department Top Three Salaries', 'hard', 1, 2, 2),
(4, 'Consecutive Numbers', 'medium', 2, 2, 6),
(5, 'Rank Scores', 'medium', 2, 2, 6),
(6, 'Customer Revenue Analysis', 'hard', 3, 1, 9),
(7, 'Employee Hierarchy Query', 'hard', 4, 1, 2),
(8, 'Monthly Sales Trends', 'easy', 3, 1, 9),
(9, 'Join Three Tables', 'medium', 6, 1, 6),
(10, 'Calculate Running Total', 'hard', 4, 1, 9);

INSERT INTO ProblemTag (Problem_ID, Tag_ID, Relevance_score) VALUES
(1, 1, 0.95),  
(1, 3, 0.80),  
(2, 5, 0.90),  
(3, 4, 0.95),  
(3, 8, 0.85),  
(4, 4, 0.90),  
(5, 4, 1.00),  
(6, 3, 0.85),  
(7, 5, 0.80),  
(9, 2, 1.00);

INSERT INTO Resource (Resource_ID, Type, URL, Title) VALUES
(1, 'Documentation', 'https://dev.mysql.com/doc/', 'MySQL Official Documentation'),
(2, 'Tutorial', 'https://www.w3schools.com/sql/', 'W3Schools SQL Tutorial'),
(3, 'Video', 'https://youtube.com/sql-basics', 'SQL Basics Video Series'),
(4, 'Article', 'https://medium.com/window-functions', 'Understanding Window Functions'),
(5, 'Book', 'https://amazon.com/sql-cookbook', 'SQL Cookbook'),
(6, 'Practice', 'https://leetcode.com/problemset/database/', 'LeetCode Database Problems'),
(7, 'Cheatsheet', 'https://github.com/sql-cheatsheet', 'SQL Syntax Cheatsheet'),
(8, 'Blog', 'https://sqlperformance.com', 'SQL Performance Tips');

INSERT INTO Reference (Problem_ID, Resource_ID) VALUES
(1, 1),  
(1, 2),  
(2, 4),  
(3, 4), 
(3, 5),  
(4, 4),  
(5, 4), 
(6, 8), 
(9, 2);

INSERT INTO FlaggedContent (Flag_ID, Reason, Status, User_ID, Problem_ID) VALUES
(1, 'Incorrect test case data', 'resolved', 1, 2),
(2, 'Ambiguous problem statement', 'reviewed', 3, 4),
(3, 'Missing edge case', 'pending', 5, 6),
(4, 'Typo in problem description', 'resolved', 7, 1),
(5, 'Outdated SQL syntax in example', 'dismissed', 8, 3),
(6, 'Duplicate problem', 'pending', 10, 5),
(7, 'Performance issue with test data', 'reviewed', 1, 10);

INSERT INTO Submission (Submission_ID, Status, Score, Runtime_ms, Canonical_sql, Gpt_sql, User_ID, Problem_ID) VALUES
(1, 'accepted', 100.00, 45, 'SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1', 'SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1', 1, 1),
(2, 'accepted', 95.50, 120, 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)', 'SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1,1', 3, 2),
(3, 'wrong_answer', 0.00, 200, 'SELECT * FROM departments', 'SELECT name, salary FROM employees', 5, 3),
(4, 'accepted', 88.75, 350, 'SELECT num FROM numbers WHERE num = LAG(num) OVER(ORDER BY id)', 'SELECT DISTINCT num FROM (SELECT num, LAG(num,1) OVER w AS prev, LEAD(num,1) OVER w AS next FROM numbers WINDOW w AS (ORDER BY id)) t WHERE num=prev AND num=next', 7, 4),
(5, 'error', NULL, NULL, 'SELECT score, RANK() OVER (ORDER BY score DESC) FROM scores', 'SELECT score RANK() OVER ORDER BY score FROM scores', 8, 5),
(6, 'accepted', 92.00, 280, 'SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id', 'SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id ORDER BY total DESC', 10, 6),
(7, 'pending', NULL, NULL, NULL, 'SELECT e1.name, e2.name AS manager FROM employees e1 LEFT JOIN employees e2 ON e1.manager_id = e2.id', 1, 7),
(8, 'accepted', 100.00, 95, 'SELECT DATE_FORMAT(date, "%Y-%m") AS month, SUM(amount) FROM sales GROUP BY month', 'SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) FROM sales GROUP BY year, month', 3, 8),
(9, 'accepted', 85.25, 180, 'SELECT a.*, b.*, c.* FROM table1 a JOIN table2 b ON a.id=b.id JOIN table3 c ON b.id=c.id', 'SELECT * FROM table1 INNER JOIN table2 USING(id) INNER JOIN table3 USING(id)', 5, 9),
(10, 'running', NULL, NULL, NULL, 'SELECT id, amount, SUM(amount) OVER (ORDER BY date) AS running_total FROM transactions', 7, 10);

INSERT INTO AutograderLog (Log_ID, Error_code, Message, Submission_ID) VALUES
(1, NULL, 'All test cases passed', 1),
(2, NULL, 'All test cases passed', 2),
(3, 'WRONG_OUTPUT', 'Expected 3 rows, got 5 rows', 3),
(4, NULL, 'All test cases passed', 4),
(5, 'SYNTAX_ERROR', 'SQL syntax error near RANK()', 5),
(6, NULL, 'All test cases passed', 6),
(7, 'TIMEOUT', 'Query execution timeout after 30 seconds', 7),
(8, NULL, 'All test cases passed', 8);

INSERT INTO InterviewSession (Session_ID, Started_at, Ended_at, Mode, Interviewer_ID, Learner_ID) VALUES
(1, '2024-11-01 09:00:00', '2024-11-01 10:30:00', 'mock', 2, 1),
(2, '2024-11-02 14:00:00', '2024-11-02 15:00:00', 'practice', 6, 3),
(3, '2024-11-03 10:00:00', '2024-11-03 11:45:00', 'real', 9, 5),
(4, '2024-11-04 13:00:00', '2024-11-04 14:30:00', 'mock', 2, 7),
(5, '2024-11-05 09:30:00', '2024-11-05 11:00:00', 'practice', 6, 8),
(6, '2024-11-06 15:00:00', NULL, 'practice', 9, 10),
(7, '2024-11-07 11:00:00', '2024-11-07 12:15:00', 'real', 2, 3);

INSERT INTO TranscriptMessage (Seq_no, Session_ID, Speaker, Content) VALUES
(1, 1, 'interviewer', 'Hello Alice, welcome to your mock SQL interview. Are you ready?'),
(2, 1, 'learner', 'Yes, I am ready. Thank you!'),
(3, 1, 'interviewer', 'Great! Let us start with a warm-up question about JOINs.'),
(4, 1, 'system', 'Problem loaded: Write a query to find all employees and their managers'),
(5, 2, 'interviewer', 'Hi Charlie, today we will practice some aggregation queries.'),
(6, 2, 'learner', 'Sounds good, I have been studying GROUP BY.'),
(7, 3, 'interviewer', 'Welcome Eve, this is your technical interview. Let us begin.'),
(8, 3, 'learner', 'Thank you for this opportunity.'),
(9, 4, 'interviewer', 'Grace, ready for some window function problems?'),
(10, 4, 'learner', 'Absolutely! I have been practicing those.');

INSERT INTO CodeCell (Cell_ID, Session_id, Executed_sql) VALUES
(1, 1, 'SELECT * FROM employees LIMIT 5;'),
(2, 1, 'SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;'),
(3, 2, 'SELECT department, COUNT(*) FROM employees GROUP BY department;'),
(4, 2, 'SELECT department, AVG(salary) FROM employees GROUP BY department HAVING AVG(salary) > 50000;'),
(5, 3, 'SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id ORDER BY SUM(amount) DESC;'),
(6, 4, 'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM employees;'),
(7, 5, 'SELECT DATE_FORMAT(order_date, "%Y-%m") AS month, COUNT(*) FROM orders GROUP BY month;'),
(8, 7, 'SELECT product_id, SUM(quantity) OVER (ORDER BY date) AS cumulative_sales FROM sales;');

INSERT INTO Embedding (Embedding_ID, Problem_ID, Vector_ref, Model_name) VALUES
(1, 1, 'embeddings/problem_1_vec.bin', 'text-embedding-ada-002'),
(2, 2, 'embeddings/problem_2_vec.bin', 'text-embedding-ada-002'),
(3, 3, 'embeddings/problem_3_vec.bin', 'text-embedding-ada-002'),
(4, 4, 'embeddings/problem_4_vec.bin', 'all-MiniLM-L6-v2'),
(5, 5, 'embeddings/problem_5_vec.bin', 'all-MiniLM-L6-v2'),
(6, 6, 'embeddings/problem_6_vec.bin', 'text-embedding-ada-002'),
(7, 10, 'embeddings/problem_10_vec.bin', 'all-MiniLM-L6-v2');

INSERT INTO Event (User_ID, Event_type, Payload_json) VALUES
(1, 'user_login', '{"ip": "192.168.1.100", "device": "Chrome/Win10"}'),
(2, 'problem_created', '{"problem_id": 1, "title": "Find Duplicate Emails"}'),
(1, 'submission_made', '{"submission_id": 1, "problem_id": 1, "status": "accepted"}'),
(3, 'user_login', '{"ip": "10.0.0.50", "device": "Safari/Mac"}'),
(3, 'submission_made', '{"submission_id": 2, "problem_id": 2, "status": "accepted"}'),
(5, 'content_flagged', '{"flag_id": 3, "problem_id": 6, "reason": "Missing edge case"}'),
(7, 'achievement_earned', '{"achievement": "10_problems_solved", "date": "2024-11-05"}'),
(8, 'user_logout', '{"session_duration": 3600}'),
(10, 'forum_post', '{"post_id": 101, "topic": "Window Functions Help"}'),
(2, 'problem_updated', '{"problem_id": 3, "changes": "Updated test cases"}');

INSERT INTO Customers (customerId, name) VALUES
(1, 'ACME Corp'),
(2, 'Globex Inc.');

INSERT INTO Customer (id, name) VALUES
(1, 'John Doe'),
(2, 'Jane Smith'),
(3, 'Bob Brown');

INSERT INTO Department (id, name) VALUES
(1, 'Engineering'),
(2, 'HR');

INSERT INTO Employee (id, name, salary, departmentId, employee_id, manager_id) VALUES
(1, 'Alice', 100000, 1, 1, NULL),
(2, 'Bob', 90000, 1, 2, 1),
(3, 'Carol', 90000, 1, 3, 1),
(4, 'Dan', 80000, 1, 4, 2),
(5, 'Eve', 70000, 2, 5, NULL),
(6, 'Frank', 65000, 2, 6, 5),
(7, 'Grace', 60000, 2, 7, 5);

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

INSERT INTO Orders (id, orderId, customerId, orderDate) VALUES
(101, 101, 1, '2025-01-10'),
(102, 102, 1, '2025-01-12'),
(103, 103, 2, '2025-01-15'),
(201, 201, 2, '2025-02-01'),
(202, 202, 2, '2025-02-03'),
(203, 203, 3, '2025-02-05');

INSERT INTO OrderItems (id, orderItemId, orderId, amount, price, quantity) VALUES
(1001, 1001, 101, 100.00, 50.00, 2),
(1002, 1002, 102, 60.00, 30.00, 2),
(1003, 1003, 103, 75.00, 25.00, 3),
(1004, 1004, 201, 40.00, 20.00, 2),
(1005, 1005, 202, 90.00, 30.00, 3),
(1006, 1006, 203, 45.00, 15.00, 3);

INSERT INTO Person (id, email) VALUES
(1, 'a@example.com'),
(2, 'b@example.com'),
(3, 'c@example.com'),
(4, 'a@example.com'),
(5, 'd@example.com'),
(6, 'b@example.com');

INSERT INTO ProblemStatement (Problem_ID, Statement, Created_at) VALUES
(1, 'Write a SQL query to find all duplicate email addresses in the Person table.
Return the email addresses that appear more than once.

Table: Person
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| email       | varchar |
+-------------+---------+
id is the primary key for this table.
Each row contains an email address of a user.', '2025-12-04 06:51:48'),

(2, 'Write a SQL query to find the second highest salary from the Employee table.
If there is no second highest salary, return NULL.

Table: Employee
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| salary      | int     |
+-------------+---------+
id is the primary key for this table.
Each row contains information about an employee''s salary.', '2025-12-04 06:51:48'),

(3, 'Write a SQL query to find the top three salaries per department.

Table: Employee
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| id            | int     |
| name          | varchar |
| salary        | int     |
| departmentId  | int     |
+---------------+---------+

Table: Department
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| name        | varchar |
+-------------+---------+
id is the primary key for both tables.
Employee.departmentId is a foreign key to Department.id.', '2025-12-04 06:51:48'),

(4, 'A sequence of numbers is provided. Find all numbers that appear consecutively at least twice.

Table: Logs
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| num         | int     |
+-------------+---------+
id is the primary key for this table.
Each row contains a number in the log sequence.', '2025-12-04 06:51:48'),

(5, 'Given a table of scores, rank the scores using dense ranking.

Table: Scores
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| score       | int     |
+-------------+---------+
id is the primary key.
Each row contains the score of a user.', '2025-12-04 06:51:48'),

(6, 'Calculate customer total revenue based on order history.

Table: Customers
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| customerId  | int     |
| name        | varchar |
+-------------+---------+

Table: Orders
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| orderId     | int     |
| customerId  | int     |
| orderDate   | date    |
+-------------+---------+

Table: OrderItems
+-------------+-------------+
| Column Name | Type        |
+-------------+-------------+
| orderItemId | int         |
| orderId     | int         |
| amount      | decimal     |
+-------------+-------------+
Primary keys are orderId, customerId, and orderItemId respectively.', '2025-12-04 06:51:48'),

(7, 'Write a SQL query to return each employee along with their manager name.

Table: Employee
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| employee_id   | int     |
| name          | varchar |
| manager_id    | int     |
+---------------+---------+
employee_id is the primary key for this table.
manager_id is a foreign key referring to another employee.', '2025-12-04 06:51:48'),

(8, 'Given a sales table with monthly sales, return monthly sales trends including month-over-month percentage change.

Table: Sales
+-------------+-------------+
| Column Name | Type        |
+-------------+-------------+
| id          | int         |
| month       | date        |
| amount      | decimal     |
+-------------+-------------+
id is the primary key.
Each row contains the sales amount for a given month.', '2025-12-04 06:51:48'),

(9, 'Join three tables to compute total order value per customer.

Table: Customer
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| name        | varchar |
+-------------+---------+

Table: Orders
+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| customerId  | int     |
+-------------+---------+

Table: OrderItems
+-------------+-------------+
| Column Name | Type        |
+-------------+-------------+
| id          | int         |
| orderId     | int         |
| price       | decimal     |
| quantity    | int         |
+-------------+-------------+', '2025-12-04 06:51:48'),

(10, 'Given a table of daily transactions, calculate the running total ordered by transaction date.

Table: Transactions
+-------------------+-------------+
| Column Name       | Type        |
+-------------------+-------------+
| id                | int         |
| amount            | decimal     |
| transactionDate   | date        |
+-------------------+-------------+
id is the primary key.
Each row contains one transaction.', '2025-12-04 06:51:48');
    
INSERT INTO Sales (id, month, amount) VALUES
(1, '2025-01-01', 1000.00),
(2, '2025-02-01', 1200.00),
(3, '2025-03-01', 900.00),
(4, '2025-04-01', 1500.00),
(5, '2025-05-01', 1500.00);

INSERT INTO Scores (id, score) VALUES
(1, 100),
(2, 90),
(3, 90),
(4, 80),
(5, 75),
(6, 60);

INSERT INTO Transactions (id, amount, transactionDate) VALUES
(1, 50.00, '2025-01-01'),
(2, 100.00, '2025-01-02'),
(3, 75.00, '2025-01-03'),
(4, 200.00, '2025-01-05'),
(5, 150.00, '2025-01-06');


UPDATE FlaggedContent 
SET Status = 'resolved', Resolved_at = NOW()
WHERE Flag_ID = 3;

UPDATE `User`
SET Admin_level = 1
WHERE User_ID = 1 AND User_type = 'student';

UPDATE LeaderboardEntry 
SET Rating = Rating + 50, Rating_ci_low = Rating - 50, Rating_ci_high = Rating + 50
WHERE User_ID = 5;

DELETE FROM Submission 
WHERE Submission_ID = 10 AND Status = 'running';

DELETE FROM FlaggedContent 
WHERE Status = 'dismissed';
