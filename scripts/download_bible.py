import requests
import os
import json

# Tentando baixar Almeida Corrigida Fiel (ACF)
url = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_acf.json"
output_path = os.path.abspath("apps/backend/src/assets/bible_acf.json")

# Remover versão antiga se existir
old_path = os.path.abspath("apps/backend/src/assets/bible_aa.json")
if os.path.exists(old_path):
    os.remove(old_path)
    print(f"Removido arquivo antigo: {old_path}")

print(f"Baixando bíblia ACF de {url}...")

try:
    response = requests.get(url)
    response.raise_for_status()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "wb") as f:
        f.write(response.content)

    print(f"Sucesso! Bíblia ACF baixada para {output_path}")
    print(f"Tamanho: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")

except Exception as e:
    print(f"Erro ao baixar: {e}")
