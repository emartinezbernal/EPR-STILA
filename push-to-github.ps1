# ERP STILA - Script para subir a GitHub
# Ejecutar en PowerShell

Write-Host "=== SUBIR ERP STILA A GITHUB ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Git
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "ERROR: Git no está instalado. Descárgalo desde https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Configurar Git si no está configurado
$userName = git config --global user.name 2>$null
if (-not $userName) {
    Write-Host "Configurando Git..." -ForegroundColor Yellow
    Write-Host "Ingresa tu nombre de usuario de GitHub:"
    $name = Read-Host
    git config --global user.name $name
    
    Write-Host "Ingresa tu email de GitHub:"
    $email = Read-Host
    git config --global user.email $email
}

# Inicializar repositorio si no existe
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
}

# Agregar archivos
Write-Host "Agregando archivos..." -ForegroundColor Yellow
git add .

# Mostrar estado
Write-Host ""
Write-Host "Archivos para commit:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host ""
Write-Host "Haciendo commit..." -ForegroundColor Yellow
$message = "ERP STILA - Actualizacion con reportes, graficos y exportacion PDF"
git commit -m $message

# Verificar remote
$remote = git remote -v 2>$null
if (-not $remote) {
    Write-Host ""
    Write-Host "Agregando remote de GitHub..." -ForegroundColor Yellow
    Write-Host "Ingresa la URL de tu repositorio (ejemplo: https://github.com/emartinezbernal/EPR-STILA.git):"
    $repoUrl = Read-Host
    git remote add origin $repoUrl
}

# Push a GitHub
Write-Host ""
Write-Host "Subiendo a GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "=== COMPLETADO ===" -ForegroundColor Green
Write-Host "Tu código está ahora en GitHub." -ForegroundColor Green
Write-Host "Ahora puedes ir a Vercel para desplegar." -ForegroundColor Cyan
