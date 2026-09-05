# Panduan Lengkap Testing Todo List REST API dengan Postman

Panduan ini menjelaskan cara menggunakan Postman untuk testing semua endpoint REST API Todo List secara lengkap.

## 📋 Daftar Isi

1. [Setup Postman](#setup-postman)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [User Management](#user-management)
5. [Category Management](#category-management)
6. [Task Management](#task-management)
7. [Error Handling](#error-handling)
8. [Tips & Best Practices](#tips--best-practices)

## 🚀 Setup Postman

### 1. Import Collection

1. Buka Postman
2. Klik **Import** di pojok kiri atas
3. Pilih file `Todo-API.postman_collection.json`
4. Klik **Import**

### 2. Setup Environment

1. Klik **Environments** di sidebar kiri
2. Klik **Create Environment**
3. Nama environment: `Todo API Local`
4. Tambahkan variables berikut:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `token` | *(kosong)* | *(kosong)* |

5. Klik **Save**
6. Pilih environment yang baru dibuat di dropdown kanan atas

## 🔧 Environment Variables

### Variables yang Digunakan

- **`base_url`**: URL dasar API (http://localhost:3000)
- **`token`**: JWT token untuk authentication (otomatis diset setelah login)

### Auto Token Management

Collection sudah dikonfigurasi untuk otomatis menyimpan token setelah login/register:

```javascript
// Script yang berjalan otomatis setelah login/register
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('token', response.data.token);
        console.log('Token saved to environment');
    }
}
```

## 🔐 Authentication Flow

### Langkah-langkah Authentication

1. **Register** user baru ATAU **Login** dengan user existing
2. Token akan otomatis tersimpan di environment
3. Gunakan token untuk endpoint yang memerlukan authentication

### Format Authorization Header

```
Authorization: Bearer {{token}}
```

## 👤 User Management

### 1. Register User Baru

**Endpoint:** `POST {{base_url}}/api/users/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validasi:**
- Username: 3-50 karakter, hanya huruf, angka, underscore
- Email: format email valid
- Password: minimal 6 karakter, harus ada huruf besar, kecil, dan angka

### 2. Login User

**Endpoint:** `POST {{base_url}}/api/users/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile

**Endpoint:** `GET {{base_url}}/api/users/profile`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 📁 Category Management

### 1. Get All Categories

**Endpoint:** `GET {{base_url}}/api/categories`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Work",
        "color": "#FF5733",
        "user_id": 1,
        "created_at": "2024-01-15T10:35:00.000Z"
      },
      {
        "id": 2,
        "name": "Personal",
        "color": "#33FF57",
        "user_id": 1,
        "created_at": "2024-01-15T10:36:00.000Z"
      }
    ]
  }
}
```

### 2. Create Category

**Endpoint:** `POST {{base_url}}/api/categories`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "name": "Work",
  "color": "#FF5733"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Work",
      "color": "#FF5733",
      "user_id": 1,
      "created_at": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

**Validasi:**
- Name: 1-100 karakter, required
- Color: format hex color (#RRGGBB), optional (default: #007bff)

### 3. Update Category

**Endpoint:** `PUT {{base_url}}/api/categories/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "name": "Work Projects",
  "color": "#FF6B35"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Work Projects",
      "color": "#FF6B35",
      "user_id": 1,
      "created_at": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### 4. Delete Category

**Endpoint:** `DELETE {{base_url}}/api/categories/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Note:** Tasks yang menggunakan category ini akan memiliki `category_id` menjadi `null`.

## ✅ Task Management

### 1. Get All Tasks

**Endpoint:** `GET {{base_url}}/api/tasks`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters (Optional):**
```
?page=1&limit=10&status=pending&priority=high&category_id=1&search=meeting
```

| Parameter | Type | Description | Values |
|-----------|------|-------------|--------|
| `page` | integer | Halaman (default: 1) | 1, 2, 3, ... |
| `limit` | integer | Items per page (default: 10, max: 100) | 1-100 |
| `status` | string | Filter by status | `pending`, `completed` |
| `priority` | string | Filter by priority | `low`, `medium`, `high` |
| `category_id` | integer | Filter by category | 1, 2, 3, ... |
| `search` | string | Search in title/description | any text |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Complete project documentation",
        "description": "Write comprehensive API documentation",
        "status": "pending",
        "priority": "high",
        "due_date": "2024-12-31",
        "category_id": 1,
        "user_id": 1,
        "created_at": "2024-01-15T10:40:00.000Z",
        "updated_at": "2024-01-15T10:40:00.000Z",
        "category_name": "Work",
        "category_color": "#FF5733"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

### 2. Get Task by ID

**Endpoint:** `GET {{base_url}}/api/tasks/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "task": {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "due_date": "2024-12-31",
      "category_id": 1,
      "user_id": 1,
      "created_at": "2024-01-15T10:40:00.000Z",
      "updated_at": "2024-01-15T10:40:00.000Z",
      "category_name": "Work",
      "category_color": "#FF5733"
    }
  }
}
```

### 3. Create Task

**Endpoint:** `POST {{base_url}}/api/tasks`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the todo application",
  "priority": "high",
  "due_date": "2024-12-31",
  "category_id": 1
}
```

**Field Descriptions:**
- `title` (required): 1-255 karakter
- `description` (optional): maksimal 1000 karakter
- `priority` (optional): `low`, `medium`, `high` (default: `medium`)
- `due_date` (optional): format ISO date (YYYY-MM-DD)
- `category_id` (optional): ID kategori yang valid

**Response Success (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation for the todo application",
      "status": "pending",
      "priority": "high",
      "due_date": "2024-12-31",
      "category_id": 1,
      "user_id": 1,
      "created_at": "2024-01-15T10:40:00.000Z",
      "updated_at": "2024-01-15T10:40:00.000Z",
      "category_name": "Work",
      "category_color": "#FF5733"
    }
  }
}
```

### 4. Update Task (Full Update)

**Endpoint:** `PUT {{base_url}}/api/tasks/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "title": "Updated task title",
  "description": "Updated description for the task",
  "status": "completed",
  "priority": "medium",
  "due_date": "2024-12-25",
  "category_id": 2
}
```

**Field Descriptions:**
- Semua field optional
- Field yang tidak disertakan akan tetap menggunakan nilai lama
- `status`: `pending`, `completed`
- `priority`: `low`, `medium`, `high`
- `due_date`: format ISO date (YYYY-MM-DD) atau `null`
- `category_id`: ID kategori yang valid atau `null`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": 1,
      "title": "Updated task title",
      "description": "Updated description for the task",
      "status": "completed",
      "priority": "medium",
      "due_date": "2024-12-25",
      "category_id": 2,
      "user_id": 1,
      "created_at": "2024-01-15T10:40:00.000Z",
      "updated_at": "2024-01-15T11:45:00.000Z",
      "category_name": "Personal",
      "category_color": "#33FF57"
    }
  }
}
```

### 5. Update Task Status (Partial Update)

**Endpoint:** `PATCH {{base_url}}/api/tasks/1/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "status": "completed"
}
```

**Field Descriptions:**
- `status` (required): `pending` atau `completed`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "completed",
      "priority": "high",
      "due_date": "2024-12-31",
      "category_id": 1,
      "user_id": 1,
      "created_at": "2024-01-15T10:40:00.000Z",
      "updated_at": "2024-01-15T11:50:00.000Z",
      "category_name": "Work",
      "category_color": "#FF5733"
    }
  }
}
```

### 6. Delete Task

**Endpoint:** `DELETE {{base_url}}/api/tasks/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## ❌ Error Handling

### Common Error Responses

#### 400 - Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Task title must be between 1 and 255 characters",
      "path": "title",
      "location": "body"
    }
  ]
}
```

#### 401 - Unauthorized (Missing/Invalid Token)
```json
{
  "success": false,
  "message": "Access token required"
}
```

#### 403 - Forbidden (Invalid Token)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Task not found"
}
```

#### 409 - Conflict (Duplicate Data)
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 💡 Tips & Best Practices

### 1. Testing Workflow

**Urutan testing yang disarankan:**

1. **Health Check** - Pastikan server berjalan
2. **Register User** - Buat user baru
3. **Login** - Dapatkan token
4. **Get Profile** - Verifikasi token bekerja
5. **Create Categories** - Buat beberapa kategori
6. **Create Tasks** - Buat tasks dengan berbagai kategori
7. **Test CRUD Operations** - Test semua operasi
8. **Test Filters & Search** - Test query parameters

### 2. Environment Management

- Gunakan environment berbeda untuk development, staging, production
- Simpan token di environment variables, jangan hardcode
- Gunakan pre-request scripts untuk setup otomatis

### 3. Collection Organization

- Kelompokkan requests berdasarkan feature
- Gunakan folder untuk organisasi yang lebih baik
- Tambahkan deskripsi pada setiap request

### 4. Testing Scripts

**Contoh test script untuk validasi response:**

```javascript
// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

// Test response time
pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

### 5. Data Management

- Gunakan dynamic data dengan `{{$randomEmail}}`, `{{$randomFirstName}}`
- Simpan ID yang dibuat untuk testing update/delete
- Cleanup data setelah testing jika diperlukan

### 6. Common Issues & Solutions

**Token Expired:**
- Login ulang untuk mendapatkan token baru
- Check JWT expiration time di environment

**404 Not Found:**
- Pastikan ID yang digunakan valid
- Check apakah resource belongs to current user

**Validation Errors:**
- Check format data sesuai dengan requirement
- Pastikan required fields tidak kosong

**Server Connection:**
- Pastikan server berjalan di port yang benar
- Check base_url di environment variables

### 7. Advanced Features

**Bulk Operations:**
```javascript
// Pre-request script untuk create multiple tasks
for (let i = 1; i <= 5; i++) {
    pm.sendRequest({
        url: pm.environment.get('base_url') + '/api/tasks',
        method: 'POST',
        header: {
            'Authorization': 'Bearer ' + pm.environment.get('token'),
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                title: `Task ${i}`,
                description: `Description for task ${i}`,
                priority: ['low', 'medium', 'high'][i % 3]
            })
        }
    });
}
```

**Performance Testing:**
```javascript
// Test untuk measure response time
const responseTime = pm.response.responseTime;
pm.globals.set('responseTime_' + pm.info.requestName, responseTime);

console.log(`Response time for ${pm.info.requestName}: ${responseTime}ms`);
```

---

## 🎯 Quick Start Checklist

- [ ] Import collection ke Postman
- [ ] Setup environment dengan base_url
- [ ] Start server (`npm start`)
- [ ] Test health check endpoint
- [ ] Register user baru
- [ ] Verify token tersimpan otomatis
- [ ] Test semua endpoint sesuai urutan
- [ ] Check error handling dengan data invalid

**Selamat testing! 🚀**