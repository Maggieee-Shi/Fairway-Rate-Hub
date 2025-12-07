CREATE SCHEMA SqlMasterClass;
USE SqlMasterClass;

CREATE TABLE `User` (
    User_ID INTEGER PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    User_type VARCHAR(50) CHECK (User_type IN ('student', 'instructor', 'admin')),
    Institution VARCHAR(255),
    Affiliation VARCHAR(255),
    Admin_level INTEGER DEFAULT 0 CHECK (Admin_level >= 0)
);

CREATE TABLE LeaderboardEntry (
    User_ID INTEGER PRIMARY KEY,
    Rating DECIMAL(10,2) DEFAULT 0.0,
    Rating_ci_low DECIMAL(10,2),
    Rating_ci_high DECIMAL(10,2),
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID) ON DELETE CASCADE
);

CREATE TABLE Role (
    Role_ID INT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Assigns (
    Role_ID INTEGER,
    User_ID INTEGER,
    Assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Role_ID, User_ID),
    FOREIGN KEY (Role_ID) REFERENCES Role(Role_ID) ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID) ON DELETE CASCADE
);

CREATE TABLE Dataset (
    Dataset_ID INTEGER PRIMARY KEY,
    Title VARCHAR(500) NOT NULL
);

CREATE TABLE DatasetVersion (
    Dataset_ID INTEGER,
    Version_no INTEGER,
    Notes TEXT,
    Released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Dataset_ID, Version_no),
    FOREIGN KEY (Dataset_ID) REFERENCES Dataset(Dataset_ID) ON DELETE CASCADE
);

CREATE TABLE Problem (
    Problem_ID INTEGER PRIMARY KEY,
    Title VARCHAR(500) NOT NULL,
    Difficulty VARCHAR(50) CHECK (Difficulty IN ('easy', 'medium', 'hard')),
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Deleted_at TIMESTAMP,
    Dataset_ID INTEGER,
    Version_no INTEGER,
    User_ID INTEGER,
    FOREIGN KEY (Dataset_ID, Version_no) REFERENCES DatasetVersion(Dataset_ID, Version_no),
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID)
);

CREATE TABLE Tag (
    Tag_ID INTEGER PRIMARY KEY,
    Name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE ProblemTag (
    Problem_ID INTEGER,
    Tag_ID INTEGER,
    Relevance_score DECIMAL(5,2) CHECK (Relevance_score >= 0 AND Relevance_score <= 1),
    PRIMARY KEY (Problem_ID, Tag_ID),
    FOREIGN KEY (Problem_ID) REFERENCES Problem(Problem_ID) ON DELETE CASCADE,
    FOREIGN KEY (Tag_ID) REFERENCES Tag(Tag_ID) ON DELETE CASCADE
);

CREATE TABLE Resource (
    Resource_ID INTEGER PRIMARY KEY,
    Type VARCHAR(100),
    URL TEXT,
    Title VARCHAR(500)
);

CREATE TABLE Reference(
    Problem_ID INTEGER,
    Resource_ID INTEGER,
    First_clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Problem_ID, Resource_ID),
    FOREIGN KEY (Problem_ID) REFERENCES Problem(Problem_ID) ON DELETE CASCADE,
    FOREIGN KEY (Resource_ID) REFERENCES Resource(Resource_ID) ON DELETE CASCADE
);

CREATE TABLE FlaggedContent (
    Flag_ID INTEGER PRIMARY KEY,
    Reason TEXT,
    Status VARCHAR(50) DEFAULT 'pending' CHECK (Status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    Opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP,
    User_ID INTEGER,
    Problem_ID INTEGER,
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID),
    FOREIGN KEY (Problem_ID) REFERENCES Problem(Problem_ID)
);

CREATE TABLE Event (
    Event_ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    User_ID INTEGER,
    Event_type VARCHAR(100) NOT NULL,
    Ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Payload_json JSON,
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID)
);

CREATE TABLE Submission (
    Submission_ID INTEGER PRIMARY KEY,
    Status VARCHAR(50) CHECK (Status IN ('pending', 'running', 'accepted', 'wrong_answer', 'error')),
    Score DECIMAL(10,2),
    Runtime_ms INTEGER,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Canonical_sql TEXT,
    Gpt_sql TEXT,
    User_ID INTEGER,
    Problem_ID INTEGER,
    FOREIGN KEY (User_ID) REFERENCES `User`(User_ID),
    FOREIGN KEY (Problem_ID) REFERENCES Problem(Problem_ID)
);

CREATE TABLE AutograderLog (
    Log_ID INTEGER PRIMARY KEY,
    Error_code VARCHAR(50),
    Message TEXT,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Submission_ID INTEGER,
    FOREIGN KEY (Submission_ID) REFERENCES Submission(Submission_ID) ON DELETE CASCADE
);

CREATE TABLE InterviewSession (
    Session_ID INTEGER PRIMARY KEY,
    Started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Ended_at TIMESTAMP,
    Mode VARCHAR(50) CHECK (Mode IN ('practice', 'mock', 'real')),
    Interviewer_ID INTEGER,
    Learner_ID INTEGER,
    FOREIGN KEY (Interviewer_ID) REFERENCES `User`(User_ID),
    FOREIGN KEY (Learner_ID) REFERENCES `User`(User_ID)
);

CREATE TABLE TranscriptMessage (
    Seq_no INTEGER,
    Session_ID INTEGER,
    Speaker VARCHAR(50) CHECK (Speaker IN ('interviewer', 'learner', 'system')),
    Content TEXT,
    Ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Seq_no, Session_ID),
    FOREIGN KEY (Session_ID) REFERENCES InterviewSession(Session_ID) ON DELETE CASCADE
);

CREATE TABLE CodeCell (
    Cell_ID INTEGER PRIMARY KEY,
    Session_id INTEGER,
    Executed_sql TEXT,
    Ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Session_id) REFERENCES InterviewSession(Session_ID) ON DELETE CASCADE
);

CREATE TABLE Embedding (
    Embedding_ID INTEGER PRIMARY KEY,
    Problem_ID INTEGER,
    Vector_ref TEXT,
    Model_name VARCHAR(100),
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Problem_ID) REFERENCES Problem(Problem_ID) ON DELETE CASCADE
);

CREATE TABLE Customers (
    customerId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Customer (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Department (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Employee (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    salary INT,
    departmentId INT,
    employee_id INT,
    manager_id INT NULL,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

CREATE TABLE Logs (
    id INT PRIMARY KEY,
    num INT
);

CREATE TABLE Orders (
    id INT PRIMARY KEY,
    orderId INT,
    customerId INT,
    orderDate DATE,
    FOREIGN KEY (customerId) REFERENCES Customer(id)
);

CREATE TABLE OrderItems (
    id INT PRIMARY KEY,
    orderItemId INT,
    orderId INT,
    amount DECIMAL(10,2),
    price DECIMAL(10,2),
    quantity INT,
    FOREIGN KEY (orderId) REFERENCES Orders(orderId)
);

CREATE TABLE Person (
    id INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE ProblemStatement (
    Problem_ID INT PRIMARY KEY,
    Statement TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Sales (
    id INT PRIMARY KEY,
    month DATE,
    amount DECIMAL(10,2)
);

CREATE TABLE Scores (
    id INT PRIMARY KEY,
    score INT
);

CREATE TABLE Transactions (
    id INT PRIMARY KEY,
    amount DECIMAL(10,2),
    transactionDate DATE
);

CREATE VIEW ActiveProblemsWithStats AS
SELECT 
    p.Problem_ID,
    p.Title,
    p.Difficulty,
    p.Created_at,
    u.Name AS Creator_Name,
    COUNT(DISTINCT s.Submission_ID) AS Total_Submissions,
    COUNT(DISTINCT CASE WHEN s.Status = 'accepted' THEN s.Submission_ID END) AS Accepted_Submissions,
    AVG(CASE WHEN s.Status = 'accepted' THEN s.Score END) AS Avg_Accepted_Score,
    COUNT(DISTINCT s.User_ID) AS Unique_Users
FROM Problem p
LEFT JOIN `User` u ON p.User_ID = u.User_ID
LEFT JOIN Submission s ON p.Problem_ID = s.Problem_ID
WHERE p.Deleted_at IS NULL
GROUP BY p.Problem_ID, p.Title, p.Difficulty, p.Created_at, u.Name;

DELIMITER $$ ;

CREATE FUNCTION calculate_acceptance_rate(user_id_param INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_submissions INT;
    DECLARE accepted_submissions INT;
    DECLARE acceptance_rate DECIMAL(5,2);
    
    SELECT COUNT(*) INTO total_submissions
    FROM Submission
    WHERE User_ID = user_id_param;
    
    IF total_submissions = 0 THEN
        RETURN 0.0;
    END IF;
    
    SELECT COUNT(*) INTO accepted_submissions
    FROM Submission
    WHERE User_ID = user_id_param AND Status = 'accepted';
    
    SET acceptance_rate = (accepted_submissions / total_submissions) * 100;
    
    RETURN ROUND(acceptance_rate, 2);
END; $$

CREATE PROCEDURE archive_old_submissions(IN days_old INT)
BEGIN
    DECLARE archived_count INT;
    
    CREATE TABLE IF NOT EXISTS Submission_Archive LIKE Submission;
    
    INSERT INTO Submission_Archive
    SELECT * FROM Submission
    WHERE Created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    SET archived_count = ROW_COUNT();
    
    DELETE FROM Submission
    WHERE Created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    SELECT CONCAT('Archived ', archived_count, ' submissions older than ', days_old, ' days') AS Result;
END; $$

CREATE TRIGGER trigger_update_leaderboard
AFTER INSERT ON Submission
FOR EACH ROW
BEGIN
    DECLARE current_rating DECIMAL(10,2);
    DECLARE new_rating DECIMAL(10,2);
    
    IF NEW.Status = 'accepted' THEN
        SELECT Rating INTO current_rating
        FROM LeaderboardEntry
        WHERE User_ID = NEW.User_ID;
        
        IF current_rating IS NULL THEN
            INSERT INTO LeaderboardEntry (User_ID, Rating, Rating_ci_low, Rating_ci_high)
            VALUES (NEW.User_ID, 1200, 1150, 1250);
        ELSE
            SET new_rating = current_rating + 10;
            
            UPDATE LeaderboardEntry
            SET 
                Rating = new_rating,
                Rating_ci_low = new_rating - 50,
                Rating_ci_high = new_rating + 50
            WHERE User_ID = NEW.User_ID;
        END IF;
    END IF;
END; $$

CREATE TRIGGER trigger_log_problem_creation
AFTER INSERT ON Problem
FOR EACH ROW
BEGIN
    INSERT INTO Event (User_ID, Event_type, Payload_json)
    VALUES (
        NEW.User_ID,
        'problem_created',
        JSON_OBJECT(
            'problem_id', NEW.Problem_ID,
            'title', NEW.Title,
            'difficulty', NEW.Difficulty
        )
    );
END; $$

CREATE TRIGGER trigger_validate_score
BEFORE INSERT ON Submission
FOR EACH ROW
BEGIN
    IF NEW.Score IS NOT NULL AND (NEW.Score < 0 OR NEW.Score > 100) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Submission score must be between 0 and 100';
    END IF;
END; $$

DELIMITER ; $$