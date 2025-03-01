#!/bin/bash
set -e

echo "🚀 Déploiement de Portrai en cours..."

sudo apt update
sudo apt install python3-hvac python3-toml


# Vérifier si les fichiers d'environnement existent
if [ ! -f .env ]; then
  echo "❌ Erreur: Fichier .env manquant"
  exit 1
fi

# Démarrer Vault et initialiser les secrets
echo "🔒 Configuration de Vault..."
sudo docker-compose --profile vault --file vault/docker-compose.vault.integration.yml up -d

# Vérifier si le fichier root_tokens.json existe déjà
if [ ! -f vault/root_tokens.json ]; then
  echo "🔑 Initialisation de Vault..."
  sudo python3 vault/vault_setup.py init --dev
else
  echo "🔓 Déverrouillage de Vault..."
  sudo python3 vault/vault_setup.py unseal --dev
fi

# Générer les secrets
echo "🔐 Génération des secrets..."
sudo python3 vault/vault_setup.py gen --dev

# Démarrer les services (Supabase, monitoring, cache)
echo "🚀 Démarrage des services..."
sudo docker-compose --env-file .env --env-file secrets.env --profile services --file docker-compose.integration.yml up -d

# Configuration du cache
echo "💾 Configuration du cache..."
sudo python3 cache/cache_setup.py init --dev --root ${DRAGONFLY_PASSWORD}

# Déploiement complet pour l'intégration (backend et frontend ensemble)
echo "⚙️ Déploiement de l'intégration (backend et frontend)..."
sudo docker-compose --env-file .env --env-file secrets.env --profile app --file docker-compose.integration.yml up -d --build

# Sceller Vault pour plus de sécurité
echo "🔒 Scellement de Vault..."
sudo python3 vault/vault_setup.py seal --dev

# Suppression du fichier secrets.env
echo "🧹 Nettoyage des fichiers sensibles..."
rm -f secrets.env

echo "✅ Déploiement terminé avec succès!"