#!/bin/bash
# Cria o secret com um GitHub PAT (repo scope) para registrar o runner.
# Gere o token em: https://github.com/settings/tokens (escopo: repo)
# Execute este script uma vez antes de aplicar o runner.

kubectl create namespace actions-runner --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic github-runner-secret \
  --namespace=actions-runner \
  --from-literal=access-token=SEU_GITHUB_PAT_AQUI \
  --dry-run=client -o yaml | kubectl apply -f -
