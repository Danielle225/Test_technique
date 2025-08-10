from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from config import Settings, settings
from routers import auth_router, note_router, search_router, partage_router

def custom_openapi(app: FastAPI):
    """Configuration personnalisée d'OpenAPI avec authentification Bearer"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="API Notes",
        version="1.0.0",
        description="API de gestion des notes avec authentification JWT",
        routes=app.routes,
    )
    
    # Ajout du schéma de sécurité Bearer
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Entrez le token JWT"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

def create_application() -> FastAPI:
    """Création et configuration de l'application FastAPI"""
    
    app = FastAPI(
        title="Notes Management API",
        description="API de gestion de notes avec authentification, recherche et partage",
        version="1.0.0",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_tags=[
            {"name": "Authentication", "description": "Opérations d'authentification"},
            {"name": "Notes", "description": "Gestion des notes"},
            {"name": "Search", "description": "Recherche dans les notes"},
            {"name": "Sharing", "description": "Partage de notes"}
        ]
    )

    # Configuration CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins, 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Inclusion des routeurs
    app.include_router(
        auth_router.router, 
        prefix="/api/v1/auth", 
        tags=["Authentication"]
    )
    app.include_router(
        note_router.router, 
        prefix="/api/v1/notes", 
        tags=["Notes"]
    )
    app.include_router(
        search_router.router, 
        prefix="/api/v1/search", 
        tags=["Search"]
    )
    app.include_router(
        partage_router.router, 
        prefix="/api/v1/sharing", 
        tags=["Sharing"]
    )

    # Configuration OpenAPI personnalisée
    app.openapi = lambda: custom_openapi(app)

    return app

# Création de l'application
app = create_application()



@app.get("/", tags=["Root"])
def root():
    """Point d'entrée principal de l'API"""
    return {
        "message": "Notes Management API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "Documentation disabled in production"
    }

@app.get("/health", tags=["Health"])
def health_check():
    """Vérification de l'état de santé de l'API"""
    return {
        "status": "healthy", 
        "environment": settings.environment,
        "debug": settings.debug
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Démarrage du serveur en mode {'développement' if settings.debug else 'production'}")
    
    uvicorn.run(
        "main:app",  
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )