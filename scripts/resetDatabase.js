const fs = require('fs');
const path = require('path');
const Database = require('../config/database');

/**
 * Script untuk reset database
 * Menghapus database file dan membuat ulang dengan tabel kosong
 */

class DatabaseReset {
    constructor() {
        this.db = new Database();
        this.dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
    }

    async reset() {
        try {
            console.log('🔄 Starting database reset...');
            
            // Close any existing connections
            await this.db.close();
            
            // Delete database file if exists
            if (fs.existsSync(this.dbPath)) {
                fs.unlinkSync(this.dbPath);
                console.log('🗑️  Deleted existing database file');
            }
            
            // Recreate database with fresh tables
            await this.db.connect();
            console.log('✅ Created new database with fresh tables');
            
            console.log('🎉 Database reset completed successfully!');
            console.log(`📍 Database location: ${this.dbPath}`);
            
        } catch (error) {
            console.error('❌ Error resetting database:', error);
            throw error;
        } finally {
            await this.db.close();
        }
    }

    async resetDataOnly() {
        try {
            console.log('🧹 Starting data-only reset...');
            
            await this.db.connect();
            const dbInstance = this.db.getDb();
            
            // Delete all data but keep table structure
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
            
            // Reset auto-increment counters
            await new Promise((resolve, reject) => {
                dbInstance.run('DELETE FROM sqlite_sequence', (err) => {
                    if (err && !err.message.includes('no such table')) reject(err);
                    else resolve();
                });
            });
            
            console.log('✅ All data cleared, tables structure preserved');
            console.log('🎉 Data-only reset completed successfully!');
            
        } catch (error) {
            console.error('❌ Error resetting data:', error);
            throw error;
        } finally {
            await this.db.close();
        }
    }

    async getStats() {
        try {
            await this.db.connect();
            const dbInstance = this.db.getDb();
            
            const stats = {};
            
            // Count users
            stats.users = await new Promise((resolve, reject) => {
                dbInstance.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });
            
            // Count categories
            stats.categories = await new Promise((resolve, reject) => {
                dbInstance.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });
            
            // Count tasks
            stats.tasks = await new Promise((resolve, reject) => {
                dbInstance.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            return { users: 0, categories: 0, tasks: 0 };
        } finally {
            await this.db.close();
        }
    }
}

// Handle command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'full';
    
    const reset = new DatabaseReset();
    
    switch (command) {
        case 'full':
            reset.reset().then(() => {
                console.log('\n✨ Full database reset completed!');
                process.exit(0);
            }).catch((error) => {
                console.error('❌ Reset failed:', error);
                process.exit(1);
            });
            break;
            
        case 'data':
            reset.resetDataOnly().then(() => {
                console.log('\n✨ Data reset completed!');
                process.exit(0);
            }).catch((error) => {
                console.error('❌ Data reset failed:', error);
                process.exit(1);
            });
            break;
            
        case 'stats':
            reset.getStats().then((stats) => {
                console.log('\n📊 Database Statistics:');
                console.log(`   Users: ${stats.users}`);
                console.log(`   Categories: ${stats.categories}`);
                console.log(`   Tasks: ${stats.tasks}`);
                console.log(`   Total Records: ${stats.users + stats.categories + stats.tasks}`);
                process.exit(0);
            }).catch((error) => {
                console.error('❌ Stats failed:', error);
                process.exit(1);
            });
            break;
            
        default:
            console.log('Usage:');
            console.log('  node resetDatabase.js [command]');
            console.log('');
            console.log('Commands:');
            console.log('  full   - Delete database file and recreate (default)');
            console.log('  data   - Clear all data but keep table structure');
            console.log('  stats  - Show current database statistics');
            process.exit(1);
    }
}

module.exports = DatabaseReset;