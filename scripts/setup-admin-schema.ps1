# PowerShell Script to Setup Admin Schema
# Run this to create all necessary tables for admin functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Admin Schema Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

$DATABASE_URL = $env:DATABASE_URL

if (-Not $DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Database URL found: " -NoNewline
Write-Host $DATABASE_URL.Substring(0, 30) -NoNewline -ForegroundColor Green
Write-Host "..." -ForegroundColor Green
Write-Host ""

# Check if psql is available
$psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue

if (-Not $psqlAvailable) {
    Write-Host "PSQL not found. Trying Python approach..." -ForegroundColor Yellow
    Write-Host ""
    
    # Use Python to execute SQL
    $pythonScript = @"
import os
import psycopg2
from urllib.parse import urlparse

database_url = os.environ.get('DATABASE_URL')
if not database_url:
    print('ERROR: DATABASE_URL not set')
    exit(1)

# Parse database URL
result = urlparse(database_url)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

print(f'Connecting to database: {database}')

try:
    conn = psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=hostname,
        port=port
    )
    
    cursor = conn.cursor()
    
    # Read and execute SQL file
    with open('etl/admin_schema_updates.sql', 'r') as f:
        sql = f.read()
    
    cursor.execute(sql)
    conn.commit()
    
    print('✓ Admin schema setup completed successfully!')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'ERROR: {str(e)}')
    exit(1)
"@
    
    Set-Content -Path "tmp_rovodev_setup_admin.py" -Value $pythonScript
    
    python tmp_rovodev_setup_admin.py
    
    Remove-Item "tmp_rovodev_setup_admin.py" -ErrorAction SilentlyContinue
    
} else {
    Write-Host "Executing SQL schema updates..." -ForegroundColor Cyan
    psql $DATABASE_URL -f "etl/admin_schema_updates.sql"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
