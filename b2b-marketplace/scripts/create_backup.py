#!/usr/bin/env python3
"""
Database Backup Script for User Model Migration
Creates a complete backup before migration and provides rollback instructions.
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

def create_backup():
    """Create database backup and export"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path("backups") / f"migration_backup_{timestamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Database connection details (update as needed)
    db_config = {
        "host": "localhost",
        "port": "5432", 
        "database": "marketplace",
        "username": "postgres",
        "password": "postgres"
    }
    
    # Create SQL dump
    dump_file = backup_dir / "database_dump.sql"
    pg_dump_cmd = [
        "pg_dump",
        "-h", db_config["host"],
        "-p", db_config["port"],
        "-U", db_config["username"],
        "-d", db_config["database"],
        "-f", str(dump_file),
        "--verbose",
        "--no-password"
    ]
    
    print(f"Creating database backup to {dump_file}")
    try:
        # Set password via environment variable
        env = os.environ.copy()
        env["PGPASSWORD"] = db_config["password"]
        
        result = subprocess.run(pg_dump_cmd, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error creating backup: {result.stderr}")
            return None
        print("Database backup created successfully")
    except Exception as e:
        print(f"Error running pg_dump: {e}")
        return None
    
    # Create backup metadata
    metadata = {
        "timestamp": timestamp,
        "backup_type": "pre_migration",
        "database": db_config["database"],
        "dump_file": str(dump_file),
        "migration_version": "24_replace_user_model",
        "rollback_instructions": [
            "1. Stop the application",
            "2. Restore database: psql -h localhost -U postgres -d marketplace < database_dump.sql",
            "3. Run: alembic downgrade -1",
            "4. Restart application"
        ]
    }
    
    metadata_file = backup_dir / "backup_metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Backup metadata saved to {metadata_file}")
    return backup_dir

def create_rollback_script(backup_dir):
    """Create rollback script"""
    rollback_script = backup_dir / "rollback.sh"
    
    script_content = f"""#!/bin/bash
# Rollback script for User Model Migration
# Generated: {datetime.now().isoformat()}

set -e

echo "Starting rollback process..."

# Check if backup exists
if [ ! -f "database_dump.sql" ]; then
    echo "Error: database_dump.sql not found in current directory"
    exit 1
fi

# Stop application (adjust as needed)
echo "Stopping application..."
# Add your application stop command here

# Restore database
echo "Restoring database from backup..."
psql -h localhost -U postgres -d marketplace < database_dump.sql

# Downgrade migration
echo "Downgrading migration..."
alembic downgrade -1

# Restart application
echo "Restarting application..."
# Add your application start command here

echo "Rollback completed successfully!"
"""
    
    with open(rollback_script, 'w') as f:
        f.write(script_content)
    
    # Make executable
    os.chmod(rollback_script, 0o755)
    print(f"Rollback script created: {rollback_script}")

if __name__ == "__main__":
    print("Creating database backup for migration...")
    backup_dir = create_backup()
    if backup_dir:
        create_rollback_script(backup_dir)
        print(f"\nBackup completed successfully!")
        print(f"Backup location: {backup_dir}")
        print("\nTo rollback if needed:")
        print(f"cd {backup_dir}")
        print("./rollback.sh")
    else:
        print("Backup failed!")
        exit(1)
