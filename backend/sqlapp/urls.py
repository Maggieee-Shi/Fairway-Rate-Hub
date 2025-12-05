from django.urls import path
from django.http import JsonResponse
from . import views

urlpatterns = [

    # ---------------------------------------------------
    # Root path
    # ---------------------------------------------------
    path("", lambda r: JsonResponse({"status": "SQL App Backend Running"})),

    # ---------------------------------------------------
    # Authentication
    # ---------------------------------------------------
    path("api/auth/login/", views.auth_login, name="auth_login"),
    path("api/auth/register/", views.auth_register, name="auth_register"),
    path("api/auth/logout/", views.auth_logout, name="auth_logout"),
    path("api/auth/me/", views.auth_me, name="auth_me"),

    # ---------------------------------------------------
    # Admin - User Management
    # ---------------------------------------------------
    path("api/admin/users/", views.admin_get_users, name="admin_get_users"),
    path("api/admin/users/<int:user_id_param>/role/", views.admin_update_user_role, name="admin_update_user_role"),
    path("api/admin/users/<int:user_id_param>/", views.admin_delete_user, name="admin_delete_user"),

    # ---------------------------------------------------
    # Problems
    # ---------------------------------------------------
    path("api/problems/", views.problems_list, name="problems_list"),
    path("api/problems/<int:problem_id>/", views.problem_detail, name="problem_detail"),
    path(
        "api/problems/<int:problem_id>/submissions/",
        views.submit_solution,
        name="submit_solution",
    ),

    # ---------------------------------------------------
    # Analytics
    # ---------------------------------------------------
    path(
        "api/student/analytics/last-submissions/",
        views.analytics_last_submissions,
        name="analytics_last_submissions",
    ),
    path(
        "api/student/analytics/time-on-task/",
        views.analytics_time_on_task,
        name="analytics_time_on_task",
    ),
    path(
        "api/student/analytics/leaderboard/",
        views.analytics_leaderboard,
        name="analytics_leaderboard",
    ),
    path(
        "api/student/analytics/active-problems/",
        views.analytics_active_problems,
        name="analytics_active_problems",
    ),

    # ---------------------------------------------------
    # Chat
    # ---------------------------------------------------
    path("api/chat/<str:role>/", views.chat_handler, name="chat_handler"),
]