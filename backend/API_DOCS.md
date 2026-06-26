# EduVerse LMS API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Module (`/api/auth`)

### Register User
* **Method**: `POST`
* **Route**: `/register`
* **Content-Type**: `multipart/form-data`
* **Payload**:
  * `name` (String, Required)
  * `email` (String, Required)
  * `password` (String, Required)
  * `role` (String, Enum: `Student`, `Instructor`. Default: `Student`)
  * `avatar` (File, Optional - Image)
* **Response (201)**:
  ```json
  {
    "success": true,
    "message": "Registration successful! Please check your email to verify your account."
  }
  ```

### Verify Email
* **Method**: `GET`
* **Route**: `/verify-email?token=<token>`
* **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Your email address has been successfully verified! You can now log in."
  }
  ```

### Login User
* **Method**: `POST`
* **Route**: `/login`
* **Payload**:
  ```json
  {
    "email": "student@eduverse.com",
    "password": "password123"
  }
  ```
* **Response (200)**: (Sets HttpOnly Cookie: `refreshToken`)
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "603f...",
      "name": "John Doe",
      "email": "student@eduverse.com",
      "role": "Student",
      "avatar": "/uploads/avatars/avatar-123.jpg"
    }
  }
  ```

### Refresh Token
* **Method**: `POST`
* **Route**: `/refresh`
* **Response (200)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi..."
  }
  ```

---

## 2. Courses Module (`/api/courses`)

### Get Courses (Public)
* **Method**: `GET`
* **Route**: `/`
* **Query Parameters**:
  * `page` (Number, Default: 1)
  * `limit` (Number, Default: 6)
  * `search` (String, Optional)
  * `instructor` (String, Optional)
* **Response (200)**:
  ```json
  {
    "success": true,
    "page": 1,
    "pages": 3,
    "total": 15,
    "courses": [...]
  }
  ```

### Enroll in Course (Student only)
* **Method**: `POST`
* **Route**: `/:id/enroll`
* **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Successfully enrolled in course"
  }
  ```

### Complete Lesson (Student only)
* **Method**: `PUT`
* **Route**: `/:id/lessons/:lessonId/complete`
* **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Lesson progress recorded",
    "course": {...}
  }
  ```

---

## 3. Assignments Module (`/api/assignments`)

### Create Assignment (Instructor/Admin)
* **Method**: `POST`
* **Route**: `/`
* **Payload**: `multipart/form-data`
  * `title` (String)
  * `description` (String)
  * `courseId` (String)
  * `dueDate` (Date)
  * `attachment` (File, Optional - PDF)

### Submit Assignment Submission (Student only)
* **Method**: `POST`
* **Route**: `/:id/submit`
* **Payload**: `multipart/form-data`
  * `assignment` (File, Required - PDF submission)

---

## 4. Quizzes Module (`/api/quizzes`)

### Get Course Quizzes
* **Method**: `GET`
* **Route**: `/course/:courseId`
* **Note**: Strips correct answer indices if the user role is `Student`.

### Submit Quiz (Student only)
* **Method**: `POST`
* **Route**: `/:id/submit`
* **Payload**:
  ```json
  {
    "answers": [1, 2, 0]
  }
  ```
