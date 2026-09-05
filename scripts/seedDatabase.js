const bcrypt = require('bcryptjs');
const Database = require('../config/database');

/**
 * Script untuk mengisi database dengan data dummy
 * Menambahkan user, kategori, dan task untuk testing
 */

class DatabaseSeeder {
    constructor() {
        this.db = new Database();
    }

    async seed() {
        try {
            console.log('🌱 Starting database seeding...');
            
            // Connect to database
            await this.db.connect();
            console.log('✅ Connected to database');

            // Clear existing data (optional)
            await this.clearData();
            
            // Seed users
            const users = await this.seedUsers();
            console.log(`✅ Created ${users.length} users`);
            
            // Seed categories
            const categories = await this.seedCategories(users);
            console.log(`✅ Created ${categories.length} categories`);
            
            // Seed tasks
            const tasks = await this.seedTasks(users, categories);
            console.log(`✅ Created ${tasks.length} tasks`);
            
            console.log('🎉 Database seeding completed successfully!');
            console.log('\n📋 Summary:');
            console.log(`   Users: ${users.length}`);
            console.log(`   Categories: ${categories.length}`);
            console.log(`   Tasks: ${tasks.length}`);
            
            // Display login credentials
            console.log('\n🔑 Test User Credentials:');
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. Email: ${user.email} | Password: ${user.plainPassword}`);
            });
            
        } catch (error) {
            console.error('❌ Error seeding database:', error);
        } finally {
            await this.db.close();
        }
    }

    async clearData() {
        console.log('🧹 Clearing existing data...');
        const dbInstance = this.db.getDb();
        
        // Delete in correct order (foreign key constraints)
        await new Promise((resolve, reject) => {
            dbInstance.run('DELETE FROM tasks', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            dbInstance.run('DELETE FROM categories', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            dbInstance.run('DELETE FROM users', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ Existing data cleared');
    }

    async seedUsers() {
        const users = [
            {
                username: 'johndoe',
                email: 'john@example.com',
                plainPassword: 'Password123',
                password: await bcrypt.hash('Password123', 10)
            },
            {
                username: 'janedoe',
                email: 'jane@example.com',
                plainPassword: 'Password123',
                password: await bcrypt.hash('Password123', 10)
            },
            {
                username: 'bobsmith',
                email: 'bob@example.com',
                plainPassword: 'Password123',
                password: await bcrypt.hash('Password123', 10)
            },
            {
                username: 'alicejohnson',
                email: 'alice@example.com',
                plainPassword: 'Password123',
                password: await bcrypt.hash('Password123', 10)
            },
            {
                username: 'mikebrown',
                email: 'mike@example.com',
                plainPassword: 'Password123',
                password: await bcrypt.hash('Password123', 10)
            }
        ];

        const dbInstance = this.db.getDb();
        const createdUsers = [];

        for (const user of users) {
            const result = await new Promise((resolve, reject) => {
                dbInstance.run(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [user.username, user.email, user.password],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID, ...user });
                    }
                );
            });
            createdUsers.push(result);
        }

        return createdUsers;
    }

    async seedCategories(users) {
        const categoryTemplates = [
            { name: 'Work', color: '#FF5733' },
            { name: 'Personal', color: '#33FF57' },
            { name: 'Health', color: '#3357FF' },
            { name: 'Education', color: '#FF33F5' },
            { name: 'Finance', color: '#F5FF33' },
            { name: 'Travel', color: '#33FFF5' },
            { name: 'Shopping', color: '#FF8C33' },
            { name: 'Family', color: '#8C33FF' },
            { name: 'Hobbies', color: '#33FF8C' },
            { name: 'Projects', color: '#FF3333' }
        ];

        const dbInstance = this.db.getDb();
        const createdCategories = [];

        // Create categories for each user (some users get different categories)
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userCategories = categoryTemplates.slice(0, 3 + (i % 3)); // Each user gets 3-5 categories
            
            for (const category of userCategories) {
                const result = await new Promise((resolve, reject) => {
                    dbInstance.run(
                        'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
                        [category.name, category.color, user.id],
                        function(err) {
                            if (err) reject(err);
                            else resolve({ 
                                id: this.lastID, 
                                ...category, 
                                user_id: user.id,
                                username: user.username
                            });
                        }
                    );
                });
                createdCategories.push(result);
            }
        }

        return createdCategories;
    }

    async seedTasks(users, categories) {
        const taskTemplates = [
            {
                title: 'Complete project documentation',
                description: 'Write comprehensive API documentation for the todo application',
                priority: 'high',
                status: 'pending',
                due_date: '2024-12-31'
            },
            {
                title: 'Review code changes',
                description: 'Review pull requests and provide feedback to team members',
                priority: 'medium',
                status: 'pending',
                due_date: '2024-12-25'
            },
            {
                title: 'Update database schema',
                description: 'Add new fields to support additional features',
                priority: 'high',
                status: 'completed',
                due_date: '2024-12-20'
            },
            {
                title: 'Plan vacation trip',
                description: 'Research destinations and book flights for summer vacation',
                priority: 'low',
                status: 'pending',
                due_date: '2025-01-15'
            },
            {
                title: 'Buy groceries',
                description: 'Weekly grocery shopping - milk, bread, fruits, vegetables',
                priority: 'medium',
                status: 'pending',
                due_date: '2024-12-22'
            },
            {
                title: 'Exercise routine',
                description: 'Morning workout - 30 minutes cardio and strength training',
                priority: 'medium',
                status: 'completed',
                due_date: '2024-12-21'
            },
            {
                title: 'Read technical book',
                description: 'Finish reading "Clean Code" by Robert Martin',
                priority: 'low',
                status: 'pending',
                due_date: '2025-01-31'
            },
            {
                title: 'Pay monthly bills',
                description: 'Pay electricity, water, internet, and phone bills',
                priority: 'high',
                status: 'pending',
                due_date: '2024-12-30'
            },
            {
                title: 'Learn new programming language',
                description: 'Start learning Rust programming language basics',
                priority: 'low',
                status: 'pending',
                due_date: '2025-02-28'
            },
            {
                title: 'Organize digital photos',
                description: 'Sort and backup photos from the last 6 months',
                priority: 'low',
                status: 'pending',
                due_date: '2025-01-10'
            },
            {
                title: 'Prepare presentation',
                description: 'Create slides for quarterly business review meeting',
                priority: 'high',
                status: 'pending',
                due_date: '2024-12-28'
            },
            {
                title: 'Call dentist',
                description: 'Schedule annual dental checkup appointment',
                priority: 'medium',
                status: 'completed',
                due_date: '2024-12-15'
            },
            {
                title: 'Update resume',
                description: 'Add recent projects and skills to professional resume',
                priority: 'medium',
                status: 'pending',
                due_date: '2025-01-20'
            },
            {
                title: 'Clean garage',
                description: 'Organize tools and donate unused items',
                priority: 'low',
                status: 'pending',
                due_date: '2025-01-05'
            },
            {
                title: 'Setup home office',
                description: 'Arrange desk, monitor, and ergonomic chair for remote work',
                priority: 'medium',
                status: 'completed',
                due_date: '2024-12-10'
            }
        ];

        const dbInstance = this.db.getDb();
        const createdTasks = [];

        // Create tasks for each user
        for (const user of users) {
            const userCategories = categories.filter(cat => cat.user_id === user.id);
            const numTasks = 8 + Math.floor(Math.random() * 7); // 8-14 tasks per user
            
            for (let i = 0; i < numTasks; i++) {
                const template = taskTemplates[i % taskTemplates.length];
                const randomCategory = userCategories[Math.floor(Math.random() * userCategories.length)];
                
                // Add some variation to tasks
                const task = {
                    ...template,
                    title: `${template.title} - ${user.username}`,
                    category_id: Math.random() > 0.2 ? randomCategory.id : null, // 20% chance of no category
                    user_id: user.id
                };
                
                const result = await new Promise((resolve, reject) => {
                    dbInstance.run(
                        'INSERT INTO tasks (title, description, status, priority, due_date, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [task.title, task.description, task.status, task.priority, task.due_date, task.category_id, task.user_id],
                        function(err) {
                            if (err) reject(err);
                            else resolve({ 
                                id: this.lastID, 
                                ...task,
                                username: user.username,
                                category_name: task.category_id ? randomCategory.name : null
                            });
                        }
                    );
                });
                createdTasks.push(result);
            }
        }

        return createdTasks;
    }
}

// Run seeder if called directly
if (require.main === module) {
    const seeder = new DatabaseSeeder();
    seeder.seed().then(() => {
        console.log('\n✨ Seeding process completed!');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}

module.exports = DatabaseSeeder;