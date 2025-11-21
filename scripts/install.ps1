# ============================================================================
# AI Workforce Analytics Platform - Installation Script
# ============================================================================
# Automated setup script for Windows PowerShell
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  AI WORKFORCE ANALYTICS PLATFORM - Installation Script" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Yellow
Write-Host ""

$hasNode = Test-Command "node"
$hasNpm = Test-Command "npm"
$hasPython = Test-Command "python"
$hasPip = Test-Command "pip"

if ($hasNode) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    Write-Host "    Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if ($hasNpm) {
    $npmVersion = npm --version
    Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    exit 1
}

if ($hasPython) {
    $pythonVersion = python --version
    Write-Host "  ✓ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found" -ForegroundColor Red
    Write-Host "    Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

if ($hasPip) {
    Write-Host "  ✓ pip: Available" -ForegroundColor Green
} else {
    Write-Host "  ✗ pip not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Install Node.js dependencies
Write-Host "Step 2: Installing Node.js dependencies..." -ForegroundColor Yellow
Write-Host ""

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Node.js dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Install Python dependencies
Write-Host "Step 3: Installing Python dependencies..." -ForegroundColor Yellow
Write-Host ""

pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ pip install failed" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Check environment variables
Write-Host "Step 4: Checking environment configuration..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path .env.local) {
    Write-Host "  ✓ .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ .env.local file not found" -ForegroundColor Yellow
    Write-Host "    Creating from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Write-Host "  ✓ .env.local created" -ForegroundColor Green
        Write-Host "    Please update DATABASE_URL in .env.local" -ForegroundColor Yellow
    } else {
        Write-Host "  ✗ .env.example not found" -ForegroundColor Red
    }
}

Write-Host ""

# Step 5: Test database connection
Write-Host "Step 5: Testing database connection..." -ForegroundColor Yellow
Write-Host ""

if ($env:DATABASE_URL) {
    Write-Host "  ✓ DATABASE_URL is set" -ForegroundColor Green
    
    # Run connection test
    python etl/test_connection.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Database connection test failed" -ForegroundColor Yellow
        Write-Host "    You may need to run schema.sql and ETL pipeline manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ DATABASE_URL environment variable not set" -ForegroundColor Yellow
    Write-Host "    Set it using:" -ForegroundColor Yellow
    Write-Host '    $env:DATABASE_URL="your_connection_string"' -ForegroundColor Cyan
}

Write-Host ""

# Summary
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Installation Summary" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Prerequisites checked" -ForegroundColor Green
Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
Write-Host "✓ Python dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set DATABASE_URL (if not already set):" -ForegroundColor White
Write-Host '   $env:DATABASE_URL="your_connection_string"' -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Create database schema:" -ForegroundColor White
Write-Host "   psql `$env:DATABASE_URL -f etl/schema.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Load data:" -ForegroundColor White
Write-Host "   python etl/clean_and_load.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Open in browser:" -ForegroundColor White
Write-Host "   http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation complete! 🎉" -ForegroundColor Green
Write-Host ""
