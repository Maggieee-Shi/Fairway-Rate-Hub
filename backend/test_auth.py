#!/usr/bin/env python3
"""
Test authentication system
Run from your Django project directory: python test_auth.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sqlapp.settings')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password, check_password

print("=" * 70)
print("AUTHENTICATION SYSTEM TEST")
print("=" * 70)
print()

# Test 1: Check if Password column exists
print("TEST 1: Check User table structure")
print("-" * 70)
try:
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE User")
        columns = cursor.fetchall()
        
    has_password = any(col[0] == 'Password' for col in columns)
    print(f"✓ User table exists")
    print(f"  Password column: {'✓ EXISTS' if has_password else '✗ MISSING'}")
    
    if not has_password:
        print("\n⚠️  ERROR: Password column is missing!")
        print("   Run: ALTER TABLE User ADD COLUMN Password VARCHAR(255);")
        sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

print()

# Test 2: Check existing users
print("TEST 2: Check existing users")
print("-" * 70)
try:
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Email, User_type, Admin_level,
                   CASE 
                       WHEN Password IS NULL THEN 'NULL'
                       WHEN Password = '' THEN 'EMPTY'
                       WHEN LENGTH(Password) < 50 THEN 'INVALID (too short)'
                       ELSE 'OK'
                   END as Password_Status
            FROM User
            WHERE Email IN ('admin@example.com', 'student@test.com', 'instructor@test.com')
        """)
        users = cursor.fetchall()
    
    if not users:
        print("⚠️  No test users found")
        print("   Creating test users...")
    else:
        for email, user_type, admin_level, pwd_status in users:
            status_icon = "✓" if pwd_status == "OK" else "✗"
            print(f"{status_icon} {email}")
            print(f"   Type: {user_type}, Admin: {admin_level}, Password: {pwd_status}")
            
except Exception as e:
    print(f"✗ Error: {e}")

print()

# Test 3: Create/Update test users with proper passwords
print("TEST 3: Create/Update test users with passwords")
print("-" * 70)

test_users = [
    ('admin@example.com', 'Admin User', 'admin123', 'Admin', 1),
    ('student@test.com', 'Test Student', 'student123', 'Student', 0),
    ('instructor@test.com', 'Test Instructor', 'instructor123', 'Instructor', 0),
]

for email, name, password, user_type, admin_level in test_users:
    try:
        password_hash = make_password(password)
        
        with connection.cursor() as cursor:
            # Check if user exists
            cursor.execute("SELECT User_ID FROM User WHERE Email = %s", [email])
            existing = cursor.fetchone()
            
            if existing:
                # Update existing user
                cursor.execute("""
                    UPDATE User 
                    SET Password = %s, User_type = %s, Admin_level = %s, Name = %s
                    WHERE Email = %s
                """, [password_hash, user_type, admin_level, name, email])
                print(f"✓ Updated: {email} (password: {password})")
            else:
                # Create new user
                cursor.execute("SELECT IFNULL(MAX(User_ID), 0) + 1 FROM User")
                new_id = cursor.fetchone()[0]
                
                cursor.execute("""
                    INSERT INTO User (User_ID, Email, Name, Password, User_type, Admin_level, Created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, [new_id, email, name, password_hash, user_type, admin_level])
                print(f"✓ Created: {email} (password: {password})")
                
        connection.commit()
        
    except Exception as e:
        print(f"✗ Error with {email}: {e}")
        connection.rollback()

print()

# Test 4: Verify password hashing works
print("TEST 4: Verify password verification works")
print("-" * 70)

for email, name, password, user_type, admin_level in test_users:
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT Password FROM User WHERE Email = %s", [email])
            result = cursor.fetchone()
            
        if result and result[0]:
            stored_hash = result[0]
            is_valid = check_password(password, stored_hash)
            
            if is_valid:
                print(f"✓ {email}: Password verification PASSED")
            else:
                print(f"✗ {email}: Password verification FAILED")
                print(f"   Password should be: {password}")
        else:
            print(f"✗ {email}: No password stored")
            
    except Exception as e:
        print(f"✗ Error verifying {email}: {e}")

print()

# Test 5: Check Django session table
print("TEST 5: Check Django session table")
print("-" * 70)
try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'django_session'")
        result = cursor.fetchone()
        
    if result:
        print("✓ django_session table exists")
    else:
        print("✗ django_session table missing")
        print("   Run: python manage.py migrate")
        
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("=" * 70)
print("TEST SUMMARY")
print("=" * 70)
print()
print("If all tests passed, try logging in with:")
print("  Admin:      admin@example.com / admin123")
print("  Student:    student@test.com / student123")
print("  Instructor: instructor@test.com / instructor123")
print()
print("If login still fails, check:")
print("1. Django server is running: python manage.py runserver")
print("2. CORS is configured in settings.py")
print("3. Frontend is using correct API URL: http://127.0.0.1:8000")
print("4. Check Django console for error messages")
print()
