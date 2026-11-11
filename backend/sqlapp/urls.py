from django.urls import path
from . import api_views, views

urlpatterns = [
    # Auth
    path("api/auth/register/", views.register),
    path("api/auth/login/", views.login_view),
    path("api/auth/logout/", views.logout_view),
    path("api/auth/me/", views.me),

    # Courses (public)
    path("api/courses/", api_views.CourseListView.as_view()),
    path("api/courses/<int:course_id>/", api_views.CourseDetailView.as_view()),
    path("api/courses/<int:course_id>/reviews/", api_views.CourseReviewCreateView.as_view()),

    # AI
    path("api/ask/", views.ask_ai),
    path("api/hot/", views.hot_questions),
    path("api/history/", views.user_history),
    path("api/view/", views.record_view),

    # Admin
    path("api/admin/reviews/", views.admin_reviews),
    path("api/admin/reviews/<int:review_id>/", views.admin_review_detail),
    path("api/admin/users/", views.admin_users),
    path("api/admin/users/<int:user_id>/", views.admin_user_detail),
    path("api/admin/cache/refresh/", views.admin_refresh_cache),
]
