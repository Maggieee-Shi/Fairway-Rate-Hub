USE FairwayRateHub;

-- Top 10 most-asked questions (for daily cache refresh preview)
SELECT question_text, answer, ask_count
FROM QuestionLog
WHERE answer IS NOT NULL
ORDER BY ask_count DESC
LIMIT 10;

-- Average rating per course with review count
SELECT
    gc.id,
    gc.name,
    gc.location,
    gc.rating_avg,
    COUNT(r.id) AS review_count
FROM GolfCourse gc
LEFT JOIN Review r ON gc.id = r.course_id AND r.status = 'approved'
GROUP BY gc.id, gc.name, gc.location, gc.rating_avg
ORDER BY gc.rating_avg DESC;

-- Recent approved reviews per course
SELECT r.id, u.name AS reviewer, gc.name AS course,
       r.rating, r.content, r.status, r.created_at
FROM Review r
JOIN `User` u ON r.user_id = u.id
JOIN GolfCourse gc ON r.course_id = gc.id
WHERE r.status = 'approved'
ORDER BY r.created_at DESC;

-- User activity summary for admin
SELECT u.id, u.name, u.email, u.user_type,
    COUNT(DISTINCT r.id) AS reviews_posted,
    COUNT(DISTINCT q.id) AS questions_asked
FROM `User` u
LEFT JOIN Review r ON r.user_id = u.id
LEFT JOIN QuestionLog q ON q.user_id = u.id
GROUP BY u.id, u.name, u.email, u.user_type
ORDER BY reviews_posted DESC;
