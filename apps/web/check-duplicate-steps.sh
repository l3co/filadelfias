#!/bin/bash

# Script para verificar steps duplicados nos arquivos de testes E2E
# Uso: ./check-duplicate-steps.sh

echo "🔍 Verificando steps duplicados..."
echo ""

# Encontrar todos os arquivos .ts em e2e/steps
STEP_FILES=$(find e2e/steps -name "*.ts" 2>/dev/null)

if [ -z "$STEP_FILES" ]; then
    echo "❌ Nenhum arquivo de steps encontrado em e2e/steps/"
    exit 1
fi

# Extrair todos os steps (Given, When, Then)
TEMP_FILE=$(mktemp)

for file in $STEP_FILES; do
    grep -E "^(Given|When|Then)\(" "$file" | sed "s/^/$(basename $file): /" >> "$TEMP_FILE"
done

# Encontrar duplicatas
echo "📋 Steps encontrados:"
sort "$TEMP_FILE" | uniq -c | sort -rn

echo ""
echo "⚠️  Steps duplicados (aparecem mais de uma vez):"
sort "$TEMP_FILE" | uniq -d | while read -r step; do
    echo ""
    echo "Step: $step"
    echo "Arquivos:"
    grep -F "$step" "$TEMP_FILE" | sed 's/^/  - /'
done

# Limpar
rm "$TEMP_FILE"

echo ""
echo "✅ Verificação concluída!"
