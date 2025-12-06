from django.shortcuts import render
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
import json
from openai import OpenAI
import os

client = OpenAI(api_key="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")

# ============================================================
# AUTHENTICATION
# ============================================================

@csrf_exempt
def auth_login(request):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "..." }
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        body = json.loads(request.body)
        email = body.get("email", "").strip()
        password = body.get("password", "")
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not email or not password:
        return JsonResponse({"error": "Email and password required"}, status=400)

    try:
        with connection.cursor() as cursor:
            # Query User table with your schema
            cursor.execute("""
                SELECT User_ID, Name, Email, Password, User_type, Admin_level
                FROM User
                WHERE Email = %s
            """, [email])
            user_row = cursor.fetchone()

        if not user_row:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        user_id, name, user_email, password_hash, user_type, admin_level = user_row

        # Check password
        if not password_hash:
            return JsonResponse({"error": "Account not set up properly"}, status=401)
            
        if not check_password(password, password_hash):
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        # Determine role based on Admin_level and User_type
        if admin_level == 1:
            role = "admin"
        elif user_type and user_type.lower() == "instructor":
            role = "instructor"
        else:
            role = "student"

        # Store user_id in session - THIS CREATES THE SESSION
        request.session['user_id'] = user_id
        
        # CRITICAL: Save the session to generate session_key
        request.session.save()

        # Create response
        response = JsonResponse({
            "id": user_id,
            "name": name,
            "email": user_email,
            "role": role,
        })
        
        # MANUALLY set the session cookie with correct SameSite
        response.set_cookie(
            key='sessionid',
            value=request.session.session_key,
            max_age=86400,  # 24 hours
            httponly=True,
            samesite=None,  # Allow cross-origin - THIS IS THE KEY
            secure=False,   # Set to True in production with HTTPS
            domain=None,
            path='/'
        )
        
        return response

    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Login failed"}, status=500)


@csrf_exempt
def auth_register(request):
    """
    POST /api/auth/register/
    Body: { "name": "...", "email": "...", "password": "...", "role": "student" }
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        body = json.loads(request.body)
        name = body.get("name", "").strip()
        email = body.get("email", "").strip()
        password = body.get("password", "")
        role = body.get("role", "student").strip().lower()
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not name or not email or not password:
        return JsonResponse({"error": "All fields required"}, status=400)

    if role not in ["student", "instructor"]:
        role = "student"

    try:
        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("""
                SELECT User_ID FROM User WHERE Email = %s
            """, [email])
            
            if cursor.fetchone():
                return JsonResponse({"error": "Email already registered"}, status=400)

            # Get next user ID
            cursor.execute("SELECT IFNULL(MAX(User_ID), 0) + 1 FROM User")
            user_id = cursor.fetchone()[0]

            # Hash password
            password_hash = make_password(password)

            # Determine User_type and Admin_level
            if role == "instructor":
                user_type = "Instructor"
                admin_level = 0
            else:
                user_type = "Student"
                admin_level = 0

            # Insert new user into your User table
            cursor.execute("""
                INSERT INTO User 
                (User_ID, Email, Name, Password, Created_at, User_type, Admin_level)
                VALUES (%s, %s, %s, %s, NOW(), %s, %s)
            """, [user_id, email, name, password_hash, user_type, admin_level])

        connection.commit()

        # Store user_id in session
        request.session['user_id'] = user_id

        return JsonResponse({
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
        })

    except Exception as e:
        connection.rollback()
        print(f"Registration error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Registration failed"}, status=500)


@csrf_exempt
def auth_logout(request):
    """
    POST /api/auth/logout/
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        request.session.flush()
        return JsonResponse({"message": "Logged out successfully"})
    except Exception as e:
        print(f"Logout error: {e}")
        return JsonResponse({"error": "Logout failed"}, status=500)


def auth_me(request):
    """
    GET /api/auth/me/
    Returns current logged-in user info
    """
    user_id = request.session.get('user_id')
    
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT User_ID, Name, Email, User_type, Admin_level, Created_at
                FROM User
                WHERE User_ID = %s
            """, [user_id])
            user_row = cursor.fetchone()

        if not user_row:
            request.session.flush()
            return JsonResponse({"error": "User not found"}, status=404)

        user_id, name, email, user_type, admin_level, created_at = user_row

        # Determine role
        if admin_level == 1:
            role = "admin"
        elif user_type and user_type.lower() == "instructor":
            role = "instructor"
        else:
            role = "student"

        return JsonResponse({
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S") if created_at else None,
        })

    except Exception as e:
        print(f"Auth me error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to fetch user"}, status=500)


# ============================================================
# ADMIN USER MANAGEMENT
# ============================================================

def admin_get_users(request):
    """
    GET /api/admin/users/
    Admin only - get all users
    """
    user_id = request.session.get('user_id')
    
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    # Check if user is admin
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT Admin_level FROM User WHERE User_ID = %s
            """, [user_id])
            admin_row = cursor.fetchone()
            
            if not admin_row or admin_row[0] != 1:
                return JsonResponse({"error": "Unauthorized"}, status=403)

            # Get all users
            cursor.execute("""
                SELECT User_ID, Name, Email, User_type, Admin_level, Created_at
                FROM User
                ORDER BY Created_at DESC
            """)
            rows = cursor.fetchall()

        results = []
        for row in rows:
            user_id_val, name, email, user_type, admin_level, created_at = row
            
            # Determine role
            if admin_level == 1:
                role = "admin"
            elif user_type and user_type.lower() == "instructor":
                role = "instructor"
            else:
                role = "student"
                
            results.append({
                "id": user_id_val,
                "name": name,
                "email": email,
                "role": role,
                "created_at": created_at.strftime("%Y-%m-%d") if created_at else None,
            })

        return JsonResponse({"results": results})

    except Exception as e:
        print(f"Get users error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to fetch users"}, status=500)


@csrf_exempt
def admin_update_user_role(request, user_id_param):
    """
    PUT /api/admin/users/<id>/role/
    Admin only - update user role
    """
    if request.method != "PUT":
        return HttpResponseNotAllowed(["PUT"])

    current_user_id = request.session.get('user_id')
    
    if not current_user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        body = json.loads(request.body)
        new_role = body.get("role", "").strip().lower()
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if new_role not in ["student", "instructor", "admin"]:
        return JsonResponse({"error": "Invalid role"}, status=400)

    try:
        with connection.cursor() as cursor:
            # Check if current user is admin
            cursor.execute("""
                SELECT Admin_level FROM User WHERE User_ID = %s
            """, [current_user_id])
            admin_row = cursor.fetchone()
            
            if not admin_row or admin_row[0] != 1:
                return JsonResponse({"error": "Unauthorized"}, status=403)

            # Update user role
            if new_role == "admin":
                user_type = "Admin"
                admin_level = 1
            elif new_role == "instructor":
                user_type = "Instructor"
                admin_level = 0
            else:  # student
                user_type = "Student"
                admin_level = 0

            cursor.execute("""
                UPDATE User
                SET User_type = %s, Admin_level = %s
                WHERE User_ID = %s
            """, [user_type, admin_level, user_id_param])

        connection.commit()

        return JsonResponse({"message": "User role updated", "role": new_role})

    except Exception as e:
        connection.rollback()
        print(f"Update role error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to update role"}, status=500)


@csrf_exempt
def admin_delete_user(request, user_id_param):
    """
    DELETE /api/admin/users/<id>/
    Admin only - delete user (permanently since no Deleted_at column)
    """
    if request.method != "DELETE":
        return HttpResponseNotAllowed(["DELETE"])

    current_user_id = request.session.get('user_id')
    
    if not current_user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    # Prevent self-deletion
    if current_user_id == user_id_param:
        return JsonResponse({"error": "Cannot delete your own account"}, status=400)

    try:
        with connection.cursor() as cursor:
            # Check if current user is admin
            cursor.execute("""
                SELECT Admin_level FROM User WHERE User_ID = %s
            """, [current_user_id])
            admin_row = cursor.fetchone()
            
            if not admin_row or admin_row[0] != 1:
                return JsonResponse({"error": "Unauthorized"}, status=403)

            # Delete user permanently
            cursor.execute("""
                DELETE FROM User
                WHERE User_ID = %s
            """, [user_id_param])

        connection.commit()

        return JsonResponse({"message": "User deleted successfully"})

    except Exception as e:
        connection.rollback()
        print(f"Delete user error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Failed to delete user"}, status=500)


# ============================================================
# Problems List API
# GET /api/problems/?difficulty=&search=
# ============================================================
def problems_list(request):
    difficulty = request.GET.get("difficulty")
    search = request.GET.get("search")

    sql = """
        SELECT p.Problem_ID AS id,
               p.Title       AS title,
               p.Difficulty  AS difficulty,
               d.Title       AS dataset
        FROM Problem p
        LEFT JOIN Dataset d ON p.Dataset_ID = d.Dataset_ID
        WHERE p.Deleted_at IS NULL
    """
    params = []

    if difficulty:
        sql += " AND p.Difficulty = %s"
        params.append(difficulty)

    if search:
        sql += " AND p.Title LIKE %s"
        params.append("%" + search + "%")

    sql += " ORDER BY p.Problem_ID"

    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        rows = cursor.fetchall()

    problems = [
        {
            "id": row[0],
            "title": row[1],
            "difficulty": row[2],
            "dataset": row[3],
            "tags": [],
        }
        for row in rows
    ]

    return JsonResponse({"results": problems})



# ============================================================
# Problem Detail API
# GET /api/problems/<id>/
# ============================================================
def problem_detail(request, problem_id):
    """
    GET /api/problems/<id>/
    Returns one problem + its statement.
    """
    sql = """
        SELECT 
            p.Problem_ID,
            p.Title,
            p.Difficulty,
            d.Title AS dataset_title,
            ps.Statement
        FROM Problem p
        LEFT JOIN Dataset d 
            ON p.Dataset_ID = d.Dataset_ID
        LEFT JOIN ProblemStatement ps 
            ON ps.Problem_ID = p.Problem_ID
        WHERE p.Problem_ID = %s
    """

    with connection.cursor() as cursor:
        cursor.execute(sql, [problem_id])
        row = cursor.fetchone()

    if not row:
        return JsonResponse({"detail": "Not found"}, status=404)

    problem = {
        "id": row[0],
        "title": row[1],
        "difficulty": row[2],
        "dataset_title": row[3],
        "statement_text": row[4],
        "example": "",
    }
    return JsonResponse(problem)



# ============================================================
# Execute Student SQL
# POST /api/problems/<id>/submissions/
# ============================================================
@csrf_exempt
def submit_solution(request, problem_id):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        body = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    sql_text = body.get("sql_text", "").strip()

    if not sql_text:
        return JsonResponse({"detail": "sql_text is required"}, status=400)

    # Get user_id from session
    user_id = request.session.get('user_id', 1)
    
    status = "executed"
    score = 0
    columns = []
    rows = []
    messages = []
    runtime_ms = 0

    try:
        with connection.cursor() as cursor:
            # Execute the user's SQL query
            import time
            start_time = time.time()
            cursor.execute(sql_text)
            end_time = time.time()
            runtime_ms = int((end_time - start_time) * 1000)

            if cursor.description:
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

        messages.append("Query executed successfully.")
        status = "success"
        score = 100

    except Exception as e:
        status = "error"
        score = 0
        messages.append(str(e))

    # Insert into Submission table
    submission_id = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT IFNULL(MAX(Submission_ID), 0) + 1 FROM Submission")
            submission_id = cursor.fetchone()[0]

            insert_submission_sql = """
                INSERT INTO Submission 
                (Submission_ID, Status, Score, Runtime_ms, Canonical_sql, Gpt_sql, User_ID, Problem_ID, Created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(insert_submission_sql, [
                submission_id,
                status,
                score,
                runtime_ms,
                sql_text,
                None,
                user_id,
                problem_id
            ])

        connection.commit()

    except Exception as e:
        print(f"Error inserting submission: {e}")
        connection.rollback()
        messages.append(f"Warning: Submission recorded but database update failed: {str(e)}")

    response = {
        "status": status,
        "score": score,
        "columns": columns,
        "rows": rows,
        "messages": messages,
        "submission_id": submission_id,
        "runtime_ms": runtime_ms,
    }

    return JsonResponse(response)



# ============================================================
# Analytics API
# /api/student/analytics/last-submissions/
# /api/student/analytics/time-on-task/
# ============================================================
# ============================================================
# Analytics helpers + APIs
# ============================================================

def _get_last_submissions_for_user(user_id, limit=10):
    """
    Return the last `limit` submissions for this user, including their SQL,
    used by both analytics API and chat tools.
    """
    sql = """
        SELECT 
            s.Submission_ID,
            s.Problem_ID,
            p.Title AS problem_title,
            s.Status,
            s.Score,
            s.Runtime_ms,
            s.Created_at,
            s.Canonical_sql,  -- student's submitted SQL
            s.Gpt_sql         -- optional GPT-generated SQL
        FROM Submission s
        LEFT JOIN Problem p ON s.Problem_ID = p.Problem_ID
        WHERE s.User_ID = %s
        ORDER BY s.Created_at DESC, s.Submission_ID DESC
        LIMIT %s
    """

    with connection.cursor() as cursor:
        cursor.execute(sql, [user_id, limit])
        rows = cursor.fetchall()

    results = []
    for row in rows:
        results.append({
            "submission_id": row[0],
            "problem_id": row[1],
            "problem_title": row[2],
            "status": row[3],
            "score": float(row[4]) if row[4] is not None else 0.0,
            "runtime_ms": row[5],
            "created_at": row[6].strftime("%Y-%m-%d %H:%M:%S") if row[6] else None,
            "submitted_sql": row[7],
            "gpt_sql": row[8],
        })
    return results


def analytics_last_submissions(request):
    """
    GET /api/student/analytics/last-submissions/
    Returns last 10 submissions for the logged-in user, including their SQL.
    """
    user_id = request.session.get('user_id', 1)

    try:
        results = _get_last_submissions_for_user(user_id, limit=10)
        return JsonResponse({"results": results})
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"results": []})

def _get_leaderboard(limit=20):
    """
    Aggregate leaderboard from SubmissionHistory:
    - total_score: SUM of all scores
    - problems_solved: count of DISTINCT accepted problems
    - rank: by total_score DESC
    """
    sql = """
        WITH UserScores AS (
            SELECT 
                sh.User_ID,
                sh.User_Name,
                SUM(COALESCE(sh.Score, 0)) AS total_score,
                COUNT(DISTINCT CASE WHEN sh.Status = 'accepted' THEN sh.Problem_ID END) AS problems_solved
            FROM SubmissionHistory sh
            GROUP BY sh.User_ID, sh.User_Name
        )
        SELECT
            User_ID,
            User_Name,
            total_score,
            problems_solved,
            RANK() OVER (ORDER BY total_score DESC) AS user_rank
        FROM UserScores
        ORDER BY user_rank ASC
        LIMIT %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, [limit])
        rows = cursor.fetchall()

    return [
        {
            "user_id": row[0],
            "user_name": row[1],
            "total_score": float(row[2]) if row[2] is not None else 0.0,
            "problems_solved": int(row[3] or 0),
            "rank": int(row[4]),
        }
        for row in rows
    ]

def analytics_time_on_task(request):
    """
    Calculate time spent per day using Event table (Ts column) or Submission table
    """
    user_id = request.session.get('user_id', 1)

    try:
        with connection.cursor() as cursor:
            # Check if Event table has data
            cursor.execute("""
                SELECT COUNT(*) 
                FROM Event 
                WHERE User_ID = %s
            """, [user_id])
            
            event_count = cursor.fetchone()[0]

            if event_count > 0:
                # Use Event table
                sql = """
                    WITH EventSessions AS (
                        SELECT 
                            DATE(Ts) as activity_date,
                            Ts,
                            LAG(Ts) OVER (PARTITION BY DATE(Ts) ORDER BY Ts) as prev_ts,
                            TIMESTAMPDIFF(MINUTE, 
                                LAG(Ts) OVER (PARTITION BY DATE(Ts) ORDER BY Ts), 
                                Ts
                            ) as gap_minutes
                        FROM Event
                        WHERE User_ID = %s
                    )
                    SELECT 
                        activity_date,
                        SUM(CASE 
                            WHEN gap_minutes IS NULL THEN 5
                            WHEN gap_minutes <= 15 THEN gap_minutes
                            ELSE 5
                        END) as total_minutes,
                        COUNT(*) as event_count
                    FROM EventSessions
                    GROUP BY activity_date
                    ORDER BY activity_date DESC
                    LIMIT 30
                """
                cursor.execute(sql, [user_id])
                rows = cursor.fetchall()
                
                results = []
                for row in rows:
                    results.append({
                        "date": row[0].strftime("%Y-%m-%d"),
                        "minutes": int(row[1]) if row[1] else 0,
                        "activity_count": row[2]
                    })
                
            else:
                # Fall back to Submission table
                sql = """
                    SELECT 
                        DATE(Created_at) as activity_date,
                        COUNT(*) as submission_count,
                        MIN(Created_at) as first_submission,
                        MAX(Created_at) as last_submission,
                        TIMESTAMPDIFF(MINUTE, MIN(Created_at), MAX(Created_at)) as session_duration
                    FROM Submission
                    WHERE User_ID = %s
                    GROUP BY DATE(Created_at)
                    ORDER BY activity_date DESC
                    LIMIT 30
                """
                cursor.execute(sql, [user_id])
                rows = cursor.fetchall()
                
                results = []
                for row in rows:
                    date = row[0]
                    submission_count = row[1]
                    session_duration = row[4] if row[4] else 0
                    
                    estimated_minutes = max(
                        session_duration + (submission_count * 5),
                        submission_count * 5
                    )
                    
                    results.append({
                        "date": date.strftime("%Y-%m-%d"),
                        "minutes": estimated_minutes,
                        "activity_count": submission_count
                    })

        return JsonResponse({"results": results})

    except Exception as e:
        print(f"Error fetching time on task: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"results": []})

def _get_leaderboard_rank_for_user(user_id):
    """
    Return this user's leaderboard entry:
    rank, score, problems solved, and total users on leaderboard.
    """
    with connection.cursor() as cursor:
        # Get this user's leaderboard row
        cursor.execute("""
            SELECT 
                le.User_ID,
                u.Name AS user_name,
                le.Total_Score,
                le.Problems_Solved,
                le.Rank
            FROM LeaderboardEntry le
            LEFT JOIN User u ON le.User_ID = u.User_ID
            WHERE le.User_ID = %s
        """, [user_id])
        row = cursor.fetchone()

        if not row:
            return None

        # Get total number of entries in leaderboard
        cursor.execute("SELECT COUNT(*) FROM LeaderboardEntry")
        total_count = cursor.fetchone()[0] or 0

    return {
        "user_id": row[0],
        "user_name": row[1],
        "total_score": float(row[2]) if row[2] else 0,
        "problems_solved": row[3],
        "rank": row[4],
        "total_users": total_count,
    }


def analytics_leaderboard(request):
    """
    GET /api/student/analytics/leaderboard/
    Returns aggregated leaderboard data using SubmissionHistory:
    - user_id, user_name, total_score, problems_solved, rank
    """
    try:
        results = _get_leaderboard(limit=20)
        return JsonResponse({"results": results})
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"results": []})


def analytics_active_problems(request):
    """
    Get problems student is currently working on
    """
    user_id = request.session.get('user_id', 1)

    sql = """
        SELECT 
            Problem_ID,
            Title,
            Difficulty,
            Attempts,
            Best_Score,
            Last_Attempted
        FROM ActiveProblemsWithStats
        WHERE User_ID = %s
        ORDER BY Last_Attempted DESC
    """

    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, [user_id])
            rows = cursor.fetchall()

        results = [
            {
                "problem_id": row[0],
                "title": row[1],
                "difficulty": row[2],
                "attempts": row[3],
                "best_score": float(row[4]) if row[4] else 0,
                "last_attempted": row[5].strftime("%Y-%m-%d %H:%M:%S") if row[5] else None,
            }
            for row in rows
        ]

        return JsonResponse({"results": results})

    except Exception as e:
        print(f"Error fetching active problems: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"results": []})



# ============================================================
# AI Chat API
# POST /api/chat/<role>/
# ============================================================
@csrf_exempt
def chat_handler(request, role):
    """
    role = "student" | "instructor"
    Front-end sends: { "message": "..." }

    Now supports tool-calling so the model can fetch user-specific data
    like "my latest submissions".
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        body = json.loads(request.body)
        msg = body.get("message", "")
    except Exception as e:
        print(f"JSON parse error: {e}")
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not msg:
        return JsonResponse({"error": "message is required"}, status=400)

    # Require login so "my submissions" is well-defined
    user_id = request.session.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    # 1) Define tools the model is allowed to call
    tools = [
    {
        "type": "function",
        "function": {
            "name": "get_last_submissions",
            "description": (
                "Get the logged-in student's most recent submissions. "
                "Use this when the user asks about their latest submission(s), "
                "recent attempts, or progress on problems."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "How many recent submissions to fetch (default 10).",
                    }
                },
                "required": [],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_leaderboard_rank",
            "description": (
                "Get the current leaderboard entry for the logged-in user, "
                "including their rank, total score, and number of problems solved. "
                "Use this when the user asks about their rank, position on the "
                "leaderboard, or how they compare to others."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False,
            },
        },
    },
]


    # 2) Base messages: describe the platform + role
    system_msg = (
        "You are a helpful assistant for a SQL learning platform called SQL Master Class. "
        "The user is logged in. "
        f"The user is acting as role: {role}. "
        "You can answer general SQL questions. "
        "If the user asks about their own activity, submissions, scores, or progress, "
        "you should call the appropriate tool instead of guessing."
    )

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": msg},
    ]

    try:
        # 3) First call: let the model decide whether to call a tool
        first_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
            tool_choice="auto",  # let model decide
        )
    except Exception as e:
        print(f"OpenAI API error (first call): {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "reply": f"(AI error) {str(e)}",
            "role": role,
        }, status=500)

    assistant_msg = first_response.choices[0].message

    # If the model decided to call a tool, execute it
    if assistant_msg.tool_calls:
        # Append the assistant's tool call message to conversation
        messages.append({
            "role": assistant_msg.role,
            "tool_calls": [tc.model_dump() for tc in assistant_msg.tool_calls],
        })

        tool_outputs = {}

        for tool_call in assistant_msg.tool_calls:
            tool_name = tool_call.function.name
            args_str = tool_call.function.arguments or "{}"

            try:
                args = json.loads(args_str)
            except json.JSONDecodeError:
                args = {}

            if tool_name == "get_last_submissions":
                limit = args.get("limit", 10)
                limit = max(1, min(limit, 50))

                try:
                    data = _get_last_submissions_for_user(user_id, limit=limit)
                except Exception as e:
                    print(f"Error in _get_last_submissions_for_user: {e}")
                    data = {"error": "Failed to fetch submissions"}

                tool_outputs[tool_name] = data

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_name,
                    "content": json.dumps(data),
                })

            elif tool_name == "get_leaderboard_rank":
                try:
                    data = _get_leaderboard_rank_for_user(user_id)
                    if data is None:
                        data = {"error": "No leaderboard entry found for this user."}
                except Exception as e:
                    print(f"Error in _get_leaderboard_rank_for_user: {e}")
                    data = {"error": "Failed to fetch leaderboard rank"}

                tool_outputs[tool_name] = data

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_name,
                    "content": json.dumps(data),
                })


        # 4) Second call: ask the model to answer the student using the tool result.
        try:
            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
            )
        except Exception as e:
            print(f"OpenAI API error (second call): {str(e)}")
            import traceback
            traceback.print_exc()
            # If second call fails, at least return raw tool data
            return JsonResponse({
                "reply": "I retrieved your data but failed to generate a summary.",
                "role": role,
                "tool_outputs": tool_outputs,
            }, status=500)

        reply_text = final_response.choices[0].message.content or ""

        # still try to extract SQL from reply
        sql_used = None
        if "```sql" in reply_text:
            import re
            match = re.search(r"```sql(.*?)```", reply_text, re.S)
            if match:
                sql_used = match.group(1).strip()

        return JsonResponse({
            "reply": reply_text,
            "role": role,
            "sql_used": sql_used,
        })

    # -------------------------------------------------------
    # No tool call: just a normal chat reply
    # -------------------------------------------------------
    reply_text = assistant_msg.content or ""

    # Optional: still extract SQL if present
    sql_used = None
    if "```sql" in reply_text:
        import re
        match = re.search(r"```sql(.*?)```", reply_text, re.S)
        if match:
            sql_used = match.group(1).strip()

    return JsonResponse({
        "reply": reply_text,
        "role": role,
        "sql_used": sql_used,
    })
