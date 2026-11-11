"""
API tests for the DRF course/review endpoints.
Run: python manage.py test sqlapp --settings=sqlapp.test_settings
"""

from django.db import connection
from django.test import TestCase

SCHEMA = [
    "CREATE TABLE `User` (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password_hash TEXT, name TEXT, user_type TEXT DEFAULT 'user')",
    "CREATE TABLE GolfCourse (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, location TEXT, rating_avg REAL DEFAULT 0, conditions TEXT)",
    "CREATE TABLE Review (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INT, course_id INT, rating INT, content TEXT, status TEXT DEFAULT 'approved', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
]


class CourseApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        with connection.cursor() as cur:
            for stmt in SCHEMA:
                cur.execute(stmt)
            cur.execute("INSERT INTO `User` (email, password_hash, name) VALUES ('a@b.c', 'x', 'Ann')")
            cur.execute("INSERT INTO GolfCourse (name, location, rating_avg, conditions) VALUES ('Lincoln Park', 'SF', 4.0, 'Firm')")
            cur.execute("INSERT INTO Review (user_id, course_id, rating, content) VALUES (1, 1, 4, 'Nice')")

    def login(self):
        session = self.client.session
        session["user_id"] = 1
        session.save()

    def test_course_list_shape(self):
        r = self.client.get("/api/courses/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(
            r.json()["courses"][0],
            {"id": 1, "name": "Lincoln Park", "location": "SF", "rating_avg": 4.0,
             "conditions": "Firm", "review_count": 1},
        )

    def test_course_detail_and_404(self):
        body = self.client.get("/api/courses/1/").json()
        self.assertEqual(body["reviews"][0]["reviewer"], "Ann")
        r = self.client.get("/api/courses/99/")
        self.assertEqual((r.status_code, r.json()), (404, {"error": "Course not found"}))

    def test_review_requires_login(self):
        r = self.client.post("/api/courses/1/reviews/", {"rating": 5}, content_type="application/json")
        self.assertEqual((r.status_code, r.json()), (401, {"error": "Authentication required"}))

    def test_review_validation(self):
        self.login()
        for bad in [{"rating": 6}, {"rating": "5"}, {"rating": 4.5}, {"rating": True}, {}]:
            r = self.client.post("/api/courses/1/reviews/", bad, content_type="application/json")
            self.assertEqual(r.status_code, 400, bad)
            self.assertEqual(r.json(), {"error": "rating must be an integer between 1 and 5"})

    def test_review_create_updates_rating(self):
        self.login()
        r = self.client.post("/api/courses/1/reviews/", {"rating": 5, "content": "  Great  "},
                             content_type="application/json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["message"], "Review submitted")
        course = self.client.get("/api/courses/1/").json()
        self.assertEqual(course["rating_avg"], 4.5)
        self.assertIn("Great", [rv["content"] for rv in course["reviews"]])
