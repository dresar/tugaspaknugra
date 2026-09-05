# Database Management Guide

Panduan lengkap untuk mengelola database Todo List API, termasuk setup, seeding, dan reset database.

## 📋 Daftar Isi

1. [Database Scripts](#database-scripts)
2. [Fake Users & Data](#fake-users--data)
3. [Database Commands](#database-commands)
4. [Database Schema](#database-schema)
5. [Testing dengan Data Dummy](#testing-dengan-data-dummy)
6. [Troubleshooting](#troubleshooting)

## 🛠️ Database Scripts

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Seed Database** | `npm run seed` | Mengisi database dengan data dummy |
| **Reset Database** | `npm run db:reset` | Menghapus dan membuat ulang database |
| **Setup Database** | `npm run db:setup` | Reset + Seed (fresh start) |
| **Database Stats** | `node scripts/resetDatabase.js stats` | Melihat statistik database |

### Script Details

#### 1. Seed Database
```bash
npm run seed
```
- Membuat 5 user dummy
- Membuat 19 kategori (3-5 per user)
- Membuat 57 tasks (8-14 per user)
- Menghapus data lama sebelum mengisi data baru

#### 2. Reset Database
```bash
npm run db:reset
```
- Menghapus file database.sqlite
- Membuat database baru dengan tabel kosong

#### 3. Setup Database (Recommended)
```bash
npm run db:setup
```
- Kombinasi reset + seed
- Memberikan database yang bersih dengan data dummy

## 👥 Fake Users & Data

### Test User Credentials

Setelah menjalankan `npm run seed`, Anda dapat menggunakan user berikut untuk testing:

| No | Username | Email | Password | Description |
|----|----------|-------|----------|-------------|
| 1 | `johndoe` | `john@example.com` | `Password123` | User utama untuk testing |
| 2 | `janedoe` | `jane@example.com` | `Password123` | User kedua |
| 3 | `bobsmith` | `bob@example.com` | `Password123` | User ketiga |
| 4 | `alicejohnson` | `alice@example.com` | `Password123` | User keempat |
| 5 | `mikebrown` | `mike@example.com` | `Password123` | User kelima |

### Data yang Dibuat

#### Categories per User
Setiap user memiliki 3-5 kategori dengan warna berbeda:
- **Work** (#FF5733)
- **Personal** (#33FF57)
- **Health** (#3357FF)
- **Education** (#FF33F5)
- **Finance** (#F5FF33)
- **Travel** (#33FFF5)
- **Shopping** (#FF8C33)
- **Family** (#8C33FF)
- **Hobbies** (#33FF8C)
- **Projects** (#FF3333)

#### Tasks per User
Setiap user memiliki 8-14 tasks dengan variasi:
- **Status**: `pending` atau `completed`
- **Priority**: `low`, `medium`, `high`
- **Due Date**: Berbagai tanggal di masa depan
- **Category**: 80% tasks memiliki kategori, 20% tanpa kategori

### Sample Task Data

```json
{
  "id": 1,
  "title": "Complete project documentation - johndoe",
  "description": "Write comprehensive API documentation for the todo application",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-12-31",
  "category_id": 1,
  "user_id": 1,
  "category_name": "Work",
  "category_color": "#FF5733"
}
```

## 💻 Database Commands

### Basic Commands

```bash
# Start fresh dengan data dummy
npm run db:setup

# Hanya mengisi data dummy (tanpa reset)
npm run seed

# Reset database (hapus semua data)
npm run db:reset

# Lihat statistik database
node scripts/resetDatabase.js stats
```

### Advanced Commands

```bash
# Reset hanya data (keep table structure)
node scripts/resetDatabase.js data

# Reset lengkap (hapus file database)
node scripts/resetDatabase.js full

# Help untuk reset script
node scripts/resetDatabase.js help
```

### Output Examples

#### Seeding Success
```
🌱 Starting database seeding...
✅ Connected to database
🧹 Clearing existing data...
✅ Existing data cleared
✅ Created 5 users
✅ Created 19 categories
✅ Created 57 tasks
🎉 Database seeding completed successfully!

📋 Summary:
   Users: 5
   Categories: 19
   Tasks: 57

🔑 Test User Credentials:
   1. Email: john@example.com | Password: Password123
   2. Email: jane@example.com | Password: Password123
   ...
```

#### Database Stats
```
📊 Database Statistics:
   Users: 5
   Categories: 19
   Tasks: 57
   Total Records: 81
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#007bff',
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  category_id INTEGER,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 Testing dengan Data Dummy

### Quick Start Testing

1. **Setup Database**
   ```bash
   npm run db:setup
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Login dengan User Dummy**
   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "Password123"
     }'
   ```

4. **Test Endpoints**
   - Import Postman collection
   - Gunakan credentials dari output seeding
   - Test semua CRUD operations

### Testing Scenarios

#### Scenario 1: User Management
```bash
# Login sebagai John
POST /api/users/login
{
  "email": "john@example.com",
  "password": "Password123"
}

# Get profile
GET /api/users/profile
Authorization: Bearer <token>
```

#### Scenario 2: Category Management
```bash
# Get categories (John memiliki 3-5 categories)
GET /api/categories
Authorization: Bearer <token>

# Create new category
POST /api/categories
{
  "name": "New Category",
  "color": "#FF0000"
}
```

#### Scenario 3: Task Management
```bash
# Get all tasks (John memiliki 8-14 tasks)
GET /api/tasks
Authorization: Bearer <token>

# Filter tasks by status
GET /api/tasks?status=pending&priority=high

# Search tasks
GET /api/tasks?search=documentation
```

### Multi-User Testing

```bash
# Login sebagai user berbeda untuk test isolation
# User 1: john@example.com
# User 2: jane@example.com
# User 3: bob@example.com

# Pastikan setiap user hanya melihat data mereka sendiri
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: SQLITE_CANTOPEN: unable to open database file
```
**Solution:**
```bash
# Check file permissions
ls -la database.sqlite

# Reset database
npm run db:reset
```

#### 2. Seeding Fails
```
Error: SQLITE_CONSTRAINT: UNIQUE constraint failed
```
**Solution:**
```bash
# Clear existing data first
npm run db:reset
npm run seed

# Or use setup command
npm run db:setup
```

#### 3. No Data After Seeding
```
Database seeding completed but no data visible
```
**Solution:**
```bash
# Check database stats
node scripts/resetDatabase.js stats

# Restart server
npm start
```

#### 4. Authentication Issues
```
401 Unauthorized
```
**Solution:**
```bash
# Make sure to use correct credentials
# Email: john@example.com
# Password: Password123

# Check if token is properly set in Postman environment
```

### Database File Location

```bash
# Default location
./database.sqlite

# Check current location
echo $DB_PATH

# Custom location (in .env)
DB_PATH=./custom/path/database.sqlite
```

### Backup & Restore

```bash
# Backup database
cp database.sqlite database_backup.sqlite

# Restore database
cp database_backup.sqlite database.sqlite

# Backup with timestamp
cp database.sqlite "database_backup_$(date +%Y%m%d_%H%M%S).sqlite"
```

## 📊 Database Monitoring

### Check Database Size
```bash
# Windows
dir database.sqlite

# Linux/Mac
ls -lh database.sqlite
```

### Query Database Directly
```bash
# Install sqlite3 CLI (if not installed)
npm install -g sqlite3

# Open database
sqlite3 database.sqlite

# Sample queries
.tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM tasks;
.quit
```

### Performance Tips

1. **Regular Cleanup**
   ```bash
   # Reset database weekly during development
   npm run db:setup
   ```

2. **Monitor Database Size**
   ```bash
   # Keep database under 100MB for development
   node scripts/resetDatabase.js stats
   ```

3. **Use Appropriate Data**
   ```bash
   # Don't seed too much data for testing
   # Current setup: 5 users, ~60 total records
   ```

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Fresh start
npm run db:setup

# Add test data
npm run seed

# Clean slate
npm run db:reset

# Check status
node scripts/resetDatabase.js stats
```

### Test Credentials
```
Email: john@example.com
Password: Password123
```

### API Testing Flow
1. `npm run db:setup` - Setup database
2. `npm start` - Start server
3. Login dengan test user
4. Test endpoints dengan Postman
5. Check data consistency

**Happy Testing! 🚀**