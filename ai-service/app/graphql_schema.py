"""Read-only GraphQL API (Strawberry) for courses, reviews, and hot questions."""

from typing import List, Optional

import strawberry

from . import db


@strawberry.type
class Review:
    id: int
    reviewer: str
    rating: int
    content: Optional[str]
    created_at: Optional[str]


@strawberry.type
class Course:
    id: int
    name: str
    location: str
    rating_avg: float
    conditions: Optional[str]
    review_count: int

    @strawberry.field
    def reviews(self, limit: int = 20) -> List[Review]:
        limit = max(1, min(limit, 100))
        with db.get_cursor() as cur:
            cur.execute(
                """
                SELECT r.id, u.name, r.rating, r.content, r.created_at
                FROM Review r JOIN `User` u ON r.user_id = u.id
                WHERE r.course_id = %s AND r.status = 'approved'
                ORDER BY r.created_at DESC
                LIMIT %s
                """,
                [self.id, limit],
            )
            return [
                Review(
                    id=r[0],
                    reviewer=r[1],
                    rating=r[2],
                    content=r[3],
                    created_at=r[4].isoformat() if r[4] else None,
                )
                for r in cur.fetchall()
            ]


@strawberry.type
class HotQuestion:
    question: str
    answer: str
    ask_count: int
    rank: Optional[int]


_COURSE_SQL = """
    SELECT gc.id, gc.name, gc.location, gc.rating_avg, gc.conditions, COUNT(r.id)
    FROM GolfCourse gc
    LEFT JOIN Review r ON r.course_id = gc.id AND r.status = 'approved'
    {where}
    GROUP BY gc.id, gc.name, gc.location, gc.rating_avg, gc.conditions
    ORDER BY gc.rating_avg DESC
    {limit}
"""


def _to_course(r) -> Course:
    return Course(
        id=r[0],
        name=r[1],
        location=r[2],
        rating_avg=float(r[3]) if r[3] is not None else 0.0,
        conditions=r[4],
        review_count=r[5],
    )


@strawberry.type
class Query:
    @strawberry.field
    def courses(self, min_rating: float = 0.0, limit: int = 50) -> List[Course]:
        limit = max(1, min(limit, 200))
        with db.get_cursor() as cur:
            cur.execute(
                _COURSE_SQL.format(where="WHERE gc.rating_avg >= %s", limit="LIMIT %s"),
                [min_rating, limit],
            )
            return [_to_course(r) for r in cur.fetchall()]

    @strawberry.field
    def course(self, id: int) -> Optional[Course]:
        with db.get_cursor() as cur:
            cur.execute(_COURSE_SQL.format(where="WHERE gc.id = %s", limit=""), [id])
            row = cur.fetchone()
        return _to_course(row) if row else None

    @strawberry.field
    def hot_questions(self, limit: int = 5) -> List[HotQuestion]:
        limit = max(1, min(limit, 10))
        with db.get_cursor() as cur:
            cur.execute(
                """
                SELECT question_text, answer, ask_count, rank_position
                FROM CachedQuestion ORDER BY rank_position ASC LIMIT %s
                """,
                [limit],
            )
            return [
                HotQuestion(question=r[0], answer=r[1], ask_count=r[2], rank=r[3])
                for r in cur.fetchall()
            ]


schema = strawberry.Schema(query=Query)
