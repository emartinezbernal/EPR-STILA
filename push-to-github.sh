#!/bin/bash

# Script para subir el proyecto a GitHub
# Ejecución en Git Bash o WSL

echo "=== SUBIR ERP STILA A GITHUB ==="
echo ""

# Verificar que git está instalado
if ! command -v git &> /dev/null; then
    echo "ERROR: Git no está instalado. Descárgalo desde https://git-scm.com"
    exit 1
fi

# Configurar Git (si no está configurado)
echo "Configurando Git..."
echo "Ingresa tu nombre de usuario:"
read -r GIT_NAME
git config --global user.name "$GIT_NAME"

echo "Ingresa tu email:"
read -r GIT_EMAIL
git config --global user.email "$GIT_EMAIL"

# Inicializar repositorio si no existe
if [ ! -d ".git" ]; then
    echo "Inicializando repositorio Git..."
    git init
fi

# Agregar todos los archivos
echo ""
echo "Agregando archivos al repositorio..."
git add .

# Ver estado
echo ""
echo "Archivos准备 para commit:"
git status --short

# Commit
echo ""
echo "Haciendo commit..."
git commit -m "ERP STILA - Actualización con reportes, gráficos y exportación PDF"

# Verificar si hay remote configurado
if ! git remote -v | grep -q "origin"; then
    echo ""
    echo "Agregando remote de GitHub..."
    echo "Ingresa la URL de tu repositorio (ejemplo: https://github.com/tu-usuario/EPR-STILA.git):"
    read -r REPO_URL
    git remote add origin "$REPO_URL"
fi

# Push a GitHub
echo ""
echo "Subiendo a GitHub..."
git push -u origin main

echo ""
echo "=== ¡COMPLETADO! ==="
echo "Tu código está ahora en GitHub."
echo "Ahora puedes ir a Vercel para desplegar."
