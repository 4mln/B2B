# Database Backup — Summary and Verification

This document describes the automated backup approach used by the project.

What we added

- `scripts/db_backup.sh`: creates gzipped SQL dumps into `/backups/db` and keeps the last N files (default 7).
- `docker-compose.yml`: a `backup` service that can run the backup script (invoked with `--once`) and mounts `/backups` as a persistent volume.
- `.github/workflows/daily_backup.yml`: sample GitHub Actions job that runs daily and uploads backups as artifacts.
- `.dockerignore`: excludes unnecessary files from Docker build context.

How to run locally (compose)

1. Start containers (db must be healthy):

```pwsh
Set-Location -Path 'c:\1\b2b-marketplace'
docker compose up -d db
# Wait for db to become healthy, then run backup once
docker compose run --rm backup
```

2. Backups will be available in the `backups/db` directory on the host (if volume is mounted to host) or in the `backups` volume.

Verification procedure

1. Run the backup once using the container or the script locally.
2. Verify the file exists (e.g., `ls backups/db/db_backup_*.sql.gz`).
3. Inspect the gzip header: `gunzip -c backups/db/db_backup_YYYYMMDD_HHMMSS.sql.gz | head -n 20`.
4. Optionally run a restore into a test database:

```pwsh
# Create a test DB and restore
createdb -h <host> -p <port> -U <user> marketplace_test
gunzip -c backups/db/db_backup_YYYYMMDD_HHMMSS.sql.gz | psql -h <host> -p <port> -U <user> -d marketplace_test
```

Retention & cleanup

- The script keeps the most recent N backups (default 7 in `scripts/db_backup.sh`).
- The CI job keeps artifacts per GitHub artifact retention policy; adjust as needed.

Security notes

- Use repository secrets for DB credentials in CI (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`).
- Restrict access to the `backups` volume and artifacts.

