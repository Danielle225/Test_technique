from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from config import Settings, settings
from routers import auth_router, note_router, search_router, partage_router
from swagger_config import create_custom_openapi, get_custom_swagger_ui_html, get_custom_redoc_html

def create_alternative_application() -> FastAPI:
    """Création d'une version alternative de l'application FastAPI avec Swagger personnalisé"""
    
    app = FastAPI(
        title="📝 Notes Management API v2",
        description="""
        # 🚀 API de Gestion des Notes - Version Alternative
        
        Une API moderne et complète pour la gestion de notes avec authentification JWT.
        
        ## ✨ Nouvelles fonctionnalités
        - Interface utilisateur améliorée
        - Documentation enrichie
        - Exemples interactifs
        - Support multi-serveurs
        """,
        version="2.0.0",
        docs_url=None,  # Désactivé pour utiliser notre version personnalisée
        redoc_url=None,  # Désactivé pour utiliser notre version personnalisée
        openapi_url="/api/v2/openapi.json",  # URL personnalisée pour OpenAPI
    )

    # Configuration CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins, 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Inclusion des routeurs avec préfixes v2
    app.include_router(
        auth_router.router, 
        prefix="/api/v2/auth", 
        tags=["Authentication"]
    )
    app.include_router(
        note_router.router, 
        prefix="/api/v2/notes", 
        tags=["Notes"]
    )
    app.include_router(
        search_router.router, 
        prefix="/api/v2/search", 
        tags=["Search"]
    )
    app.include_router(
        partage_router.router, 
        prefix="/api/v2/sharing", 
        tags=["Sharing"]
    )

    # Configuration OpenAPI personnalisée
    app.openapi = lambda: create_custom_openapi(app)

    # Swagger UI personnalisé
    @app.get("/docs", response_class=HTMLResponse, include_in_schema=False)
    async def custom_swagger_ui():
        return get_custom_swagger_ui_html()

    # ReDoc personnalisé
    @app.get("/redoc", response_class=HTMLResponse, include_in_schema=False)
    async def custom_redoc():
        return get_custom_redoc_html()

    # Documentation alternative avec Swagger UI classique
    @app.get("/docs-classic", response_class=HTMLResponse, include_in_schema=False)
    async def classic_swagger_ui():
        from fastapi.openapi.docs import get_swagger_ui_html
        return get_swagger_ui_html(
            openapi_url="/api/v2/openapi.json",
            title="Notes API - Classic Swagger UI"
        )

    return app

# Création de l'application alternative
app_v2 = create_alternative_application()

@app_v2.get("/", tags=["Root"])
def root_v2():
    """Point d'entrée principal de l'API v2 avec Swagger personnalisé"""
    return {
        "message": "🚀 Notes Management API v2",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "📚 Documentation enrichie",
            "🎨 Interface utilisateur améliorée", 
            "🔧 Configuration avancée",
            "📊 Exemples interactifs"
        ],
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc", 
            "classic_swagger": "/docs-classic",
            "openapi_json": "/api/v2/openapi.json"
        }
    }

@app_v2.get("/health", tags=["Health"])
def health_check_v2():
    """Vérification de l'état de santé de l'API v2"""
    return {
        "status": "healthy", 
        "version": "2.0.0",
        "environment": settings.environment,
        "debug": settings.debug,
        "features": {
            "custom_swagger": True,
            "redoc_support": True,
            "enhanced_docs": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Démarrage du serveur API v2 en mode {'développement' if settings.debug else 'production'}")
    print("📚 Documentation disponible sur:")
    print("   - Swagger UI: http://localhost:8001/docs")
    print("   - ReDoc: http://localhost:8001/redoc")
    print("   - Classic Swagger: http://localhost:8001/docs-classic")
    
    uvicorn.run(
        "main_v2:app_v2",  
        host="0.0.0.0",
        port=8001,  # Port différent pour éviter les conflits
        reload=settings.debug,
        log_level="info"
    )
