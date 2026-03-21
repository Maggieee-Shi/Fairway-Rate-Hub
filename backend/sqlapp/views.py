import json
import math
import os

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _json_body(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}


def _current_user(request):
    uid = request.session.get("user_id")
    if not uid:
        return None
    with connection.cursor() as cur:
        cur.execute(
            "SELECT id, email, name, user_type FROM `User` WHERE id = %s", [uid]
        )
        row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "name": row[2], "user_type": row[3]}


def _require_login(request):
    user = _current_user(request)
    if not user:
        return None, JsonResponse({"error": "Authentication required"}, status=401)
    return user, None


def _require_admin(request):
    user, err = _require_login(request)
    if err:
        return None, err
    if user["user_type"] != "admin":
        return None, JsonResponse({"error": "Admin access required"}, status=403)
    return user, None


def _cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def _get_embedding(text):
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding


def _call_gpt4(messages):
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=800,
    )
    return resp.choices[0].message.content


GOLF_SYSTEM_PROMPT = (
    "You are Fairway Rate Hub's expert assistant for Bay Area golf courses. "
    "You have real-time knowledge of course conditions, ratings, tee availability, and local golf insights. "
    "IMPORTANT: Only answer questions that are directly related to golf — "
    "courses, equipment, rules, tips, conditions, ratings, or tee times. "
    "If the user asks anything unrelated to golf, respond exactly with: "
    "'Please ask a golf related question.' and nothing else.\n\n"
    "FORMATTING RULES — you MUST follow these exactly when recommending courses:\n"
    "1. Each course gets its own block separated by a line containing only: ---\n"
    "2. Each block must follow this exact structure with real newlines:\n"
    "**Course Name**\n"
    "One sentence description.\n"
    "• Characteristic 1\n"
    "• Characteristic 2\n"
    "• Characteristic 3\n"
    "---\n"
    "3. Never put bullets on the same line. Each bullet must be on its own line starting with •.\n"
    "4. Do not include any URLs or map links.\n"
)

SIMILARITY_THRESHOLD = 0.85


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    data = _json_body(request)
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    name = (data.get("name") or "").strip()

    if not email or not password or not name:
        return JsonResponse({"error": "email, password, and name are required"}, status=400)
    if len(password) < 6:
        return JsonResponse({"error": "Password must be at least 6 characters"}, status=400)

    with connection.cursor() as cur:
        cur.execute("SELECT id FROM `User` WHERE email = %s", [email])
        if cur.fetchone():
            return JsonResponse({"error": "Email already registered"}, status=400)

        hashed = make_password(password)
        cur.execute(
            "INSERT INTO `User` (email, password_hash, name, user_type) VALUES (%s, %s, %s, 'user')",
            [email, hashed, name],
        )
        user_id = cur.lastrowid

    request.session["user_id"] = user_id
    return JsonResponse({"id": user_id, "email": email, "name": name, "user_type": "user"})


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    data = _json_body(request)
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return JsonResponse({"error": "email and password are required"}, status=400)

    with connection.cursor() as cur:
        cur.execute(
            "SELECT id, email, name, user_type, password_hash FROM `User` WHERE email = %s",
            [email],
        )
        row = cur.fetchone()

    if not row or not check_password(password, row[4]):
        return JsonResponse({"error": "Invalid email or password"}, status=401)

    request.session["user_id"] = row[0]
    return JsonResponse({"id": row[0], "email": row[1], "name": row[2], "user_type": row[3]})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    request.session.flush()
    return JsonResponse({"message": "Logged out"})


@require_http_methods(["GET"])
def me(request):
    user = _current_user(request)
    if not user:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    return JsonResponse(user)


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def courses_list(request):
    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT gc.id, gc.name, gc.location, gc.rating_avg, gc.conditions,
                   COUNT(r.id) AS review_count
            FROM GolfCourse gc
            LEFT JOIN Review r ON r.course_id = gc.id AND r.status = 'approved'
            GROUP BY gc.id, gc.name, gc.location, gc.rating_avg, gc.conditions
            ORDER BY gc.rating_avg DESC
            """
        )
        rows = cur.fetchall()

    courses = [
        {
            "id": r[0],
            "name": r[1],
            "location": r[2],
            "rating_avg": float(r[3]) if r[3] is not None else 0.0,
            "conditions": r[4],
            "review_count": r[5],
        }
        for r in rows
    ]
    return JsonResponse({"courses": courses})


@require_http_methods(["GET"])
def course_detail(request, course_id):
    with connection.cursor() as cur:
        cur.execute(
            "SELECT id, name, location, rating_avg, conditions FROM GolfCourse WHERE id = %s",
            [course_id],
        )
        row = cur.fetchone()
        if not row:
            return JsonResponse({"error": "Course not found"}, status=404)

        cur.execute(
            """
            SELECT r.id, u.name AS reviewer, r.rating, r.content, r.created_at
            FROM Review r
            JOIN `User` u ON r.user_id = u.id
            WHERE r.course_id = %s AND r.status = 'approved'
            ORDER BY r.created_at DESC
            """,
            [course_id],
        )
        reviews = [
            {
                "id": rv[0],
                "reviewer": rv[1],
                "rating": rv[2],
                "content": rv[3],
                "created_at": rv[4].isoformat() if rv[4] else None,
            }
            for rv in cur.fetchall()
        ]

    return JsonResponse(
        {
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "rating_avg": float(row[3]) if row[3] is not None else 0.0,
            "conditions": row[4],
            "reviews": reviews,
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def course_reviews(request, course_id):
    user, err = _require_login(request)
    if err:
        return err

    data = _json_body(request)
    rating = data.get("rating")
    content = (data.get("content") or "").strip()

    if rating is None or not isinstance(rating, int) or not (1 <= rating <= 5):
        return JsonResponse({"error": "rating must be an integer between 1 and 5"}, status=400)

    with connection.cursor() as cur:
        cur.execute("SELECT id FROM GolfCourse WHERE id = %s", [course_id])
        if not cur.fetchone():
            return JsonResponse({"error": "Course not found"}, status=404)

        cur.execute(
            """
            INSERT INTO Review (user_id, course_id, rating, content, status)
            VALUES (%s, %s, %s, %s, 'approved')
            """,
            [user["id"], course_id, rating, content],
        )
        review_id = cur.lastrowid
        _recalculate_rating(cur, course_id)

    return JsonResponse({"id": review_id, "message": "Review submitted"}, status=201)


# ---------------------------------------------------------------------------
# AI — Ask a question
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def ask_ai(request):
    user, err = _require_login(request)
    if err:
        return err

    data = _json_body(request)
    question = (data.get("question") or "").strip()
    if not question:
        return JsonResponse({"error": "question is required"}, status=400)

    # Generate embedding for semantic similarity check
    try:
        new_embedding = _get_embedding(question)
    except Exception as e:
        print(f"[EMBEDDING ERROR] {e}")
        return JsonResponse({"error": f"Embedding service error: {str(e)}"}, status=502)

    # Check existing QuestionLog for a semantically similar cached answer
    with connection.cursor() as cur:
        cur.execute(
            "SELECT id, question_embedding, answer FROM QuestionLog WHERE answer IS NOT NULL"
        )
        existing = cur.fetchall()

    best_match_id = None
    best_similarity = 0.0
    best_answer = None

    for row in existing:
        log_id, embedding_json, answer = row
        if not embedding_json:
            continue
        try:
            stored_vec = (
                json.loads(embedding_json)
                if isinstance(embedding_json, str)
                else embedding_json
            )
            sim = _cosine_similarity(new_embedding, stored_vec)
            if sim > best_similarity:
                best_similarity = sim
                best_match_id = log_id
                best_answer = answer
        except Exception:
            continue

    if best_similarity >= SIMILARITY_THRESHOLD and best_answer:
        with connection.cursor() as cur:
            # Increment global ask_count on the matched entry
            cur.execute(
                "UPDATE QuestionLog SET ask_count = ask_count + 1 WHERE id = %s",
                [best_match_id],
            )
            # Also record this user's specific question so history is complete
            cur.execute(
                """
                INSERT INTO QuestionLog (user_id, question_text, question_embedding, answer, ask_count)
                VALUES (%s, %s, %s, %s, 1)
                """,
                [user["id"], question, json.dumps(new_embedding), best_answer],
            )
        return JsonResponse({"answer": best_answer, "cached": True})

    # Cache miss — call GPT-4 with real-time context
    try:
        answer = _call_gpt4([
            {"role": "system", "content": GOLF_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ])
    except Exception as e:
        print(f"[GPT ERROR] {e}")
        return JsonResponse({"error": f"AI service error: {str(e)}"}, status=502)

    embedding_json = json.dumps(new_embedding)
    with connection.cursor() as cur:
        cur.execute(
            """
            INSERT INTO QuestionLog (user_id, question_text, question_embedding, answer, ask_count)
            VALUES (%s, %s, %s, %s, 1)
            """,
            [user["id"], question, embedding_json, answer],
        )

    return JsonResponse({"answer": answer, "cached": False})


# ---------------------------------------------------------------------------
# Hot Questions (public — 3 for visitors, 10 for logged-in users)
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def hot_questions(request):
    user = _current_user(request)
    limit = 10 if user else 3

    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT question_text, answer, ask_count, rank_position
            FROM CachedQuestion
            ORDER BY rank_position ASC
            LIMIT %s
            """,
            [limit],
        )
        rows = cur.fetchall()

    questions = [
        {
            "question": r[0],
            "answer": r[1],
            "ask_count": r[2],
            "rank": r[3],
        }
        for r in rows
    ]
    return JsonResponse({"questions": questions, "is_authenticated": user is not None})


# ---------------------------------------------------------------------------
# User — Question History
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def user_history(request):
    user = _current_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT id, question_text, answer, asked_at
            FROM QuestionLog
            WHERE user_id = %s
            ORDER BY asked_at DESC
            LIMIT 5
            """,
            [user["id"]],
        )
        rows = cur.fetchall()

    history = [
        {
            "id": r[0],
            "question": r[1],
            "answer": r[2],
            "asked_at": r[3].isoformat() if r[3] else None,
        }
        for r in rows
    ]
    return JsonResponse({"history": history})


# ---------------------------------------------------------------------------
# Admin — Reviews
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def admin_reviews(request):
    _, err = _require_admin(request)
    if err:
        return err

    status_filter = request.GET.get("status", "")
    with connection.cursor() as cur:
        if status_filter:
            cur.execute(
                """
                SELECT r.id, u.name AS reviewer, gc.name AS course,
                       r.rating, r.content, r.status, r.created_at
                FROM Review r
                JOIN `User` u ON r.user_id = u.id
                JOIN GolfCourse gc ON r.course_id = gc.id
                WHERE r.status = %s
                ORDER BY r.created_at DESC
                """,
                [status_filter],
            )
        else:
            cur.execute(
                """
                SELECT r.id, u.name AS reviewer, gc.name AS course,
                       r.rating, r.content, r.status, r.created_at
                FROM Review r
                JOIN `User` u ON r.user_id = u.id
                JOIN GolfCourse gc ON r.course_id = gc.id
                ORDER BY r.created_at DESC
                """
            )
        rows = cur.fetchall()

    reviews = [
        {
            "id": r[0],
            "reviewer": r[1],
            "course": r[2],
            "rating": r[3],
            "content": r[4],
            "status": r[5],
            "created_at": r[6].isoformat() if r[6] else None,
        }
        for r in rows
    ]
    return JsonResponse({"reviews": reviews})


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def admin_review_detail(request, review_id):
    _, err = _require_admin(request)
    if err:
        return err

    with connection.cursor() as cur:
        cur.execute("SELECT id, course_id FROM Review WHERE id = %s", [review_id])
        row = cur.fetchone()
        if not row:
            return JsonResponse({"error": "Review not found"}, status=404)
        course_id = row[1]

    if request.method == "DELETE":
        with connection.cursor() as cur:
            cur.execute("DELETE FROM Review WHERE id = %s", [review_id])
            _recalculate_rating(cur, course_id)
        return JsonResponse({"message": "Review deleted"})

    # PUT — update status
    data = _json_body(request)
    new_status = data.get("status")
    if new_status not in ("approved", "rejected", "pending"):
        return JsonResponse({"error": "status must be approved, rejected, or pending"}, status=400)

    with connection.cursor() as cur:
        cur.execute("UPDATE Review SET status = %s WHERE id = %s", [new_status, review_id])
        _recalculate_rating(cur, course_id)

    return JsonResponse({"message": f"Review status updated to {new_status}"})


def _recalculate_rating(cursor, course_id):
    cursor.execute(
        "SELECT AVG(rating) FROM Review WHERE course_id = %s AND status = 'approved'",
        [course_id],
    )
    avg = cursor.fetchone()[0]
    new_avg = round(float(avg), 1) if avg else 0.0
    cursor.execute(
        "UPDATE GolfCourse SET rating_avg = %s WHERE id = %s", [new_avg, course_id]
    )


# ---------------------------------------------------------------------------
# Admin — Users
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def admin_users(request):
    _, err = _require_admin(request)
    if err:
        return err

    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT u.id, u.name, u.email, u.user_type, u.created_at,
                   COUNT(DISTINCT r.id) AS reviews, COUNT(DISTINCT q.id) AS questions
            FROM `User` u
            LEFT JOIN Review r ON r.user_id = u.id
            LEFT JOIN QuestionLog q ON q.user_id = u.id
            GROUP BY u.id, u.name, u.email, u.user_type, u.created_at
            ORDER BY u.created_at DESC
            """
        )
        rows = cur.fetchall()

    users = [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "user_type": r[3],
            "created_at": r[4].isoformat() if r[4] else None,
            "reviews": r[5],
            "questions": r[6],
        }
        for r in rows
    ]
    return JsonResponse({"users": users})


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def admin_user_detail(request, user_id):
    admin, err = _require_admin(request)
    if err:
        return err

    with connection.cursor() as cur:
        cur.execute("SELECT id FROM `User` WHERE id = %s", [user_id])
        if not cur.fetchone():
            return JsonResponse({"error": "User not found"}, status=404)

    if request.method == "DELETE":
        if user_id == admin["id"]:
            return JsonResponse({"error": "Cannot delete your own account"}, status=400)
        with connection.cursor() as cur:
            cur.execute("DELETE FROM `User` WHERE id = %s", [user_id])
        return JsonResponse({"message": "User deleted"})

    # PUT — update role
    data = _json_body(request)
    new_type = data.get("user_type")
    if new_type not in ("user", "admin"):
        return JsonResponse({"error": "user_type must be 'user' or 'admin'"}, status=400)

    with connection.cursor() as cur:
        cur.execute("UPDATE `User` SET user_type = %s WHERE id = %s", [new_type, user_id])

    return JsonResponse({"message": f"User role updated to {new_type}"})


# ---------------------------------------------------------------------------
# Admin — Manual cache refresh
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def admin_refresh_cache(request):
    _, err = _require_admin(request)
    if err:
        return err

    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT question_text, answer, ask_count
            FROM QuestionLog
            WHERE answer IS NOT NULL
            ORDER BY ask_count DESC
            LIMIT 10
            """
        )
        rows = cur.fetchall()

        cur.execute("DELETE FROM CachedQuestion")

        for rank, (q_text, answer, ask_count) in enumerate(rows, 1):
            cur.execute(
                """
                INSERT INTO CachedQuestion (question_text, answer, ask_count, rank_position, cached_at)
                VALUES (%s, %s, %s, %s, NOW())
                """,
                [q_text, answer, ask_count, rank],
            )

    return JsonResponse({"message": f"Cache refreshed with {len(rows)} questions"})
