from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from config import settings

def create_custom_openapi(app: FastAPI, title: str = "Notes API v2", version: str = "2.0.0"):
    """Configuration OpenAPI personnalisée pour une version alternative"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=title,
        version=version,
        description="""
        # 📝 Notes Management API - Version Alternative
        
        Cette API permet de gérer des notes avec authentification JWT.
        
        ## 🔐 Authentification
        - Utilisez le endpoint `/api/v1/auth/login` pour obtenir un token
        - Ajoutez le token dans l'header: `Authorization: Bearer YOUR_TOKEN`
        
        ## 📚 Fonctionnalités principales
        - ✅ Gestion complète des notes (CRUD)
        - 🔍 Recherche avancée dans les notes
        - 🤝 Partage de notes (privé, partagé, public)
        - 🏷️ Système de tags
        - 🔒 Authentification JWT sécurisée
        
        ## 🎯 Statuts de visibilité
        - **privé**: Visible uniquement par le propriétaire
        - **partagé**: Partageable avec des utilisateurs spécifiques
        - **public**: Accessible publiquement via un token
        """,
        routes=app.routes,
        contact={
            "name": "Notes API Support",
            "email": "support@notesapi.com",
        },
        license_info={
            "name": "MIT License",
            "url": "https://opensource.org/licenses/MIT",
        }
    )
    
    # Configuration de sécurité avancée
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "🔑 Entrez votre token JWT (sans le préfixe 'Bearer')"
        },
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "🗝️ Clé API alternative (optionnelle)"
        }
    }
    
    # Sécurité globale
    openapi_schema["security"] = [
        {"BearerAuth": []},
        {"ApiKeyAuth": []}
    ]
    
    # Ajout de serveurs multiples
    openapi_schema["servers"] = [
        {
            "url": "http://localhost:8000",
            "description": "🚀 Serveur de développement"
        },
        {
            "url": "https://api.notesapp.com",
            "description": "🌐 Serveur de production"
        }
    ]
    
    # Tags avec descriptions étendues
    openapi_schema["tags"] = [
        {
            "name": "Authentication",
            "description": "🔐 **Authentification et gestion des utilisateurs**\n\nEndpoints pour l'inscription, la connexion et la gestion des tokens JWT."
        },
        {
            "name": "Notes",
            "description": "📝 **Gestion complète des notes**\n\nCRUD complet pour les notes avec support Markdown, tags et visibilité."
        },
        {
            "name": "Search",
            "description": "🔍 **Recherche avancée**\n\nRecherche textuelle dans les notes, filtrage par tags et critères multiples."
        },
        {
            "name": "Sharing",
            "description": "🤝 **Partage et collaboration**\n\nPartage sécurisé des notes, accès public et gestion des permissions."
        },
        {
            "name": "Health",
            "description": "🏥 **Monitoring et santé**\n\nEndpoints de surveillance et vérification du statut de l'API."
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

def get_custom_swagger_ui_html():
    """Interface Swagger UI personnalisée"""
    return get_swagger_ui_html(
        openapi_url="/api/v2/openapi.json",
        title="📝 Notes API - Documentation Interactive",
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css",
        swagger_ui_parameters={
            "deepLinking": True,
            "displayRequestDuration": True,
            "docExpansion": "none",
            "operationsSorter": "method",
            "filter": True,
            "showExtensions": True,
            "showCommonExtensions": True,
            "tryItOutEnabled": True,
            "persistAuthorization": True,
            "layout": "BaseLayout",
            "defaultModelsExpandDepth": 2,
            "defaultModelExpandDepth": 2,
        }
    )

# Configuration pour ReDoc (alternative à Swagger UI)
def get_custom_redoc_html():
    """Interface ReDoc personnalisée"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>📝 Notes API - ReDoc Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 0;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header h1 {
                margin: 0;
                font-size: 2.5em;
                font-weight: 300;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 1.1em;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📝 Notes Management API</h1>
            <p>Documentation complète et interactive - Version ReDoc</p>
        </div>
        <redoc spec-url='/api/v2/openapi.json' theme='stacked'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"></script>
    </body>
    </html>
    """)
