/*
Find all accepted submissions with user details, problem information, 
and the dataset they belong to. Show the user's name, email, problem title, 
difficulty, score, and dataset title.
*/

SELECT 
    u.Name AS User_Name,
    u.Email AS User_Email,
    p.Title AS Problem_Title,
    p.Difficulty,
    s.Score,
    s.Runtime_ms,
    d.Title AS Dataset_Title,
    s.Created_at AS Submission_Date
FROM 
    Submission s
    INNER JOIN `User` u ON s.User_ID = u.User_ID
    INNER JOIN Problem p ON s.Problem_ID = p.Problem_ID
    INNER JOIN DatasetVersion dv ON p.Dataset_ID = dv.Dataset_ID 
                                 AND p.Version_no = dv.Version_no
    INNER JOIN Dataset d ON dv.Dataset_ID = d.Dataset_ID
WHERE 
    s.Status = 'accepted'
ORDER BY 
    s.Score DESC, s.Runtime_ms ASC;

    
/*
Find users who have submitted at least 2 problems and calculate their 
average score, total submissions, and acceptance rate. Only show users with an 
average score greater than 80. Order by acceptance rate descending.
*/
SELECT 
    u.User_ID,
    u.Name AS User_Name,
    u.Institution,
    COUNT(s.Submission_ID) AS Total_Submissions,
    COUNT(CASE WHEN s.Status = 'accepted' THEN 1 END) AS Accepted_Count,
    ROUND(COUNT(CASE WHEN s.Status = 'accepted' THEN 1 END) * 100.0 / COUNT(s.Submission_ID), 2) AS Acceptance_Rate,
    ROUND(AVG(CASE WHEN s.Status = 'accepted' THEN s.Score END), 2) AS Avg_Score
FROM 
    `User` u
    INNER JOIN Submission s ON u.User_ID = s.User_ID
GROUP BY 
    u.User_ID, u.Name, u.Institution
HAVING 
    COUNT(s.Submission_ID) >= 2
    AND AVG(CASE WHEN s.Status = 'accepted' THEN s.Score END) > 80
ORDER BY 
    Acceptance_Rate DESC, Avg_Score DESC;

/*
For each problem difficulty level, show the number of problems, 
total submissions, average score of accepted submissions, and the number of 
unique users who attempted them. Only include difficulties with more than 
1 problem. Order by average score descending.
*/

SELECT 
    p.Difficulty,
    COUNT(DISTINCT p.Problem_ID) AS Problem_Count,
    COUNT(s.Submission_ID) AS Total_Submissions,
    COUNT(CASE WHEN s.Status = 'accepted' THEN 1 END) AS Accepted_Submissions,
    ROUND(AVG(CASE WHEN s.Status = 'accepted' THEN s.Score END), 2) AS Avg_Accepted_Score,
    COUNT(DISTINCT s.User_ID) AS Unique_Users,
    ROUND(COUNT(CASE WHEN s.Status = 'accepted' THEN 1 END) * 100.0 / 
          COUNT(s.Submission_ID), 2) AS Success_Rate
FROM 
    Problem p
    LEFT JOIN Submission s ON p.Problem_ID = s.Problem_ID
WHERE 
    p.Deleted_at IS NULL
GROUP BY 
    p.Difficulty
HAVING 
    COUNT(DISTINCT p.Problem_ID) > 1
ORDER BY 
    Avg_Accepted_Score DESC;
    

/*
Using a CTE, find all instructors and show their created problems 
along with the submission statistics for each problem. Include problems 
that have received at least one submission.
*/

WITH InstructorProblems AS (
    SELECT 
        u.User_ID,
        u.Name AS Instructor_Name,
        u.Email,
        p.Problem_ID,
        p.Title AS Problem_Title,
        p.Difficulty,
        p.Created_at
    FROM 
        `User` u
        INNER JOIN Problem p ON u.User_ID = p.User_ID
    WHERE 
        u.User_type = 'instructor'
        AND p.Deleted_at IS NULL
),
SubmissionStats AS (
    SELECT 
        Problem_ID,
        COUNT(*) AS Total_Attempts,
        COUNT(CASE WHEN Status = 'accepted' THEN 1 END) AS Accepted_Count,
        AVG(CASE WHEN Status = 'accepted' THEN Score END) AS Avg_Score,
        MIN(CASE WHEN Status = 'accepted' THEN Runtime_ms END) AS Best_Runtime
    FROM 
        Submission
    GROUP BY 
        Problem_ID
)
SELECT 
    ip.Instructor_Name,
    ip.Email,
    ip.Problem_Title,
    ip.Difficulty,
    COALESCE(ss.Total_Attempts, 0) AS Total_Attempts,
    COALESCE(ss.Accepted_Count, 0) AS Accepted_Count,
    ROUND(COALESCE(ss.Avg_Score, 0), 2) AS Avg_Score,
    ss.Best_Runtime
FROM 
    InstructorProblems ip
    LEFT JOIN SubmissionStats ss ON ip.Problem_ID = ss.Problem_ID
WHERE 
    ss.Total_Attempts > 0
ORDER BY 
    ip.Instructor_Name, ss.Total_Attempts DESC;
    
/*
Find all users whose acceptance rate is higher than the average 
acceptance rate of all users. Show their name, total submissions, accepted 
count, and their acceptance rate compared to the overall average.
*/

SELECT 
    u.User_ID,
    u.Name,
    u.Email,
    u.Institution,
    user_stats.Total_Submissions,
    user_stats.Accepted_Submissions,
    user_stats.Acceptance_Rate,
    (SELECT ROUND(AVG(acceptance_pct), 2)
     FROM (
         SELECT 
             COUNT(CASE WHEN Status = 'accepted' THEN 1 END) * 100.0 / COUNT(*) AS acceptance_pct
         FROM Submission
         GROUP BY User_ID
         HAVING COUNT(*) > 0
     ) AS all_rates
    ) AS Overall_Avg_Rate
FROM 
    `User` u
    INNER JOIN (
        SELECT 
            User_ID,
            COUNT(*) AS Total_Submissions,
            COUNT(CASE WHEN Status = 'accepted' THEN 1 END) AS Accepted_Submissions,
            ROUND(COUNT(CASE WHEN Status = 'accepted' THEN 1 END) * 100.0 / COUNT(*), 2) AS Acceptance_Rate
        FROM 
            Submission
        GROUP BY 
            User_ID
        HAVING 
            COUNT(*) > 0
    ) AS user_stats ON u.User_ID = user_stats.User_ID
WHERE 
    user_stats.Acceptance_Rate > (
        SELECT AVG(acceptance_pct)
        FROM (
            SELECT 
                COUNT(CASE WHEN Status = 'accepted' THEN 1 END) * 100.0 / COUNT(*) AS acceptance_pct
            FROM Submission
            GROUP BY User_ID
            HAVING COUNT(*) > 0
        ) AS avg_calc
    )
ORDER BY 
    user_stats.Acceptance_Rate DESC;