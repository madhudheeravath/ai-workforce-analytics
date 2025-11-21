# ============================================================================
# Run ETL Pipeline - PowerShell Script
# ============================================================================
# Automates the ETL process with proper error checking
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  AI WORKFORCE ANALYTICS PLATFORM - ETL Pipeline" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL environment variable not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it using:" -ForegroundColor Yellow
    Write-Host '$env:DATABASE_URL="your_connection_string"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✓ DATABASE_URL is set" -ForegroundColor Green
Write-Host ""

# Check if data files exist
Write-Host "Checking data files..." -ForegroundColor Yellow
$dataFiles = @(
    "Data\industry_report_metrics.csv",
    "Data\public_opinion_responses.csv",
    "Data\survey_empirical_responses.csv"
)

$allFilesExist = $true
foreach ($file in $dataFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "ERROR: Some data files are missing" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Run ETL pipeline
Write-Host "Running ETL pipeline..." -ForegroundColor Yellow
Write-Host ""

python etl/clean_and_load.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "  ✓ ETL PIPELINE COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Start the development server" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "  ✗ ETL PIPELINE FAILED" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and:" -ForegroundColor Yellow
    Write-Host "  1. Verify DATABASE_URL is correct" -ForegroundColor Yellow
    Write-Host "  2. Ensure database schema is created" -ForegroundColor Yellow
    Write-Host "  3. Check data file formats" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
