"""
Course and review endpoints built with Django REST Framework.

The response shapes match the previous function-based views exactly, so the
React frontend needs no changes. Auth stays session-based: DRF's own
authentication is disabled and IsSessionUser reads the session user the same
way the rest of the app does.
"""

from django.db import connection
from rest_framework import status
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CourseDetailSerializer, CourseSerializer, ReviewCreateSerializer
from .views import _current_user, _recalculate_rating


class IsSessionUser(BasePermission):
    message = "Authentication required"

    def has_permission(self, request, view):
        request.session_user = _current_user(request)
        return request.session_user is not None


def _first_error(errors):
    """Flatten DRF's {field: [msg]} into the app's {"error": msg} convention."""
    for msgs in errors.values():
        return str(msgs[0] if isinstance(msgs, list) else msgs)
    return "Invalid request"


class CourseListView(APIView):
    def get(self, request):
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
        return Response({"courses": CourseSerializer(courses, many=True).data})


class CourseDetailView(APIView):
    def get(self, request, course_id):
        with connection.cursor() as cur:
            cur.execute(
                "SELECT id, name, location, rating_avg, conditions FROM GolfCourse WHERE id = %s",
                [course_id],
            )
            row = cur.fetchone()
            if not row:
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            cur.execute(
                """
                SELECT r.id, u.name, r.rating, r.content, r.created_at
                FROM Review r
                JOIN `User` u ON r.user_id = u.id
                WHERE r.course_id = %s AND r.status = 'approved'
                ORDER BY r.created_at DESC
                """,
                [course_id],
            )
            reviews = [
                {"id": rv[0], "reviewer": rv[1], "rating": rv[2], "content": rv[3], "created_at": rv[4]}
                for rv in cur.fetchall()
            ]
        course = {
            "id": row[0],
            "name": row[1],
            "location": row[2],
            "rating_avg": float(row[3]) if row[3] is not None else 0.0,
            "conditions": row[4],
            "reviews": reviews,
        }
        return Response(CourseDetailSerializer(course).data)


class CourseReviewCreateView(APIView):
    permission_classes = [IsSessionUser]

    def permission_denied(self, request, message=None, code=None):
        # Keep the app's {"error": ...} body and 401 status for anonymous users.
        from rest_framework.exceptions import NotAuthenticated

        raise NotAuthenticated(detail=message)

    def handle_exception(self, exc):
        from rest_framework.exceptions import NotAuthenticated

        response = super().handle_exception(exc)
        if response is not None and isinstance(exc, NotAuthenticated):
            # DRF downgrades 401 to 403 when no authenticator is configured.
            response.status_code = status.HTTP_401_UNAUTHORIZED
        if response is not None and isinstance(response.data, dict) and "detail" in response.data:
            response.data = {"error": str(response.data["detail"])}
        return response

    def post(self, request, course_id):
        ser = ReviewCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response({"error": _first_error(ser.errors)}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cur:
            cur.execute("SELECT id FROM GolfCourse WHERE id = %s", [course_id])
            if not cur.fetchone():
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            cur.execute(
                """
                INSERT INTO Review (user_id, course_id, rating, content, status)
                VALUES (%s, %s, %s, %s, 'approved')
                """,
                [request.session_user["id"], course_id, ser.validated_data["rating"],
                 ser.validated_data["content"]],
            )
            review_id = cur.lastrowid
            _recalculate_rating(cur, course_id)

        return Response({"id": review_id, "message": "Review submitted"}, status=status.HTTP_201_CREATED)
