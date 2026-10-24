# Backend Django

Le point d’entrée Django est `core.settings` (également utilisé par `manage.py`,
ASGI et WSGI).

## Démarrer en local

Depuis ce dossier, avec l’environnement Python du projet activé :

```powershell
python manage.py migrate
python manage.py runserver
```

Sans configuration de base de données, Django utilise SQLite dans `db.sqlite3`.
Pour PostgreSQL, renseigner `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
`DB_HOST` et `DB_PORT` dans l’environnement.

La connexion Angular doit être autorisée dans `CORS_ALLOWED_ORIGINS` (par défaut
`http://localhost:4200`). En production, définir `SECRET_KEY`, `DEBUG=False`,
`ALLOWED_HOSTS`, `FRONTEND_URL` et un serveur de courrier adapté.

## Routes principales

- `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/logout/`
- `POST /api/auth/forgot-password/`, `POST /api/auth/reset-password/`
- `GET /api/apprenant/catalogue/`; parcours inscrits, progression, quiz, résultats,
  certificats, notifications et forum sous `/api/apprenant/`
- Gestion formateur sous `/api/formateur/` : cours, quiz, copies, apprenants,
  documents, statistiques, profil, conversations et notifications
- Catalogue des catégories et endpoints de cours sous `/api/`

Les routes apprenant et formateur exigent un jeton JWT et un rôle correspondant.
Les migrations font partie du dépôt : après leur application, le contenu métier
est conservé dans la base plutôt que dans des données de démonstration.
