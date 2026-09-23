CREATE SCHEMA IF NOT EXISTS FairwayRateHub;
USE FairwayRateHub;

CREATE TABLE `User` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GolfCourse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating_avg DECIMAL(3,1) DEFAULT 0.0,
    conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    rating INT NOT NULL,
    content TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES GolfCourse(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

-- Composite index for fast per-course review lookups
CREATE INDEX idx_review_course ON Review(course_id, status);

CREATE TABLE QuestionLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question_text TEXT NOT NULL,
    question_embedding JSON,
    answer TEXT,
    ask_count INT DEFAULT 1,
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE SET NULL
);

-- Index for daily cache job ordering
CREATE INDEX idx_question_ask_count ON QuestionLog(ask_count DESC);

CREATE TABLE CachedQuestion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    ask_count INT DEFAULT 1,
    rank_position INT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cached_rank ON CachedQuestion(rank_position);
