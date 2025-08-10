from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Settings, settings
from database.database import init_db
from routers import auth_router, note_router, search_router, partage_router

def create_application() -> FastAPI:
    app = FastAPI(
        title="Notes Management API",
        description="API de gestion de notes avec authentification, recherche et partage",
        version="1.0.0",
        docs_url="/docs" ,
        redoc_url="/redoc" 
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins, 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


    app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(note_router.router, prefix="/api/v1/notes", tags=["Notes"])
    app.include_router(search_router.router, prefix="/api/v1/search", tags=["Search"])
    app.include_router(partage_router.router, prefix="/api/v1/sharing", tags=["Sharing"])

    return app

app = create_application()



@app.get("/")
def root():
    return {
        "message": "Notes Management API",
        "version": "1.0.0",
        "docs": "/docs" if settings.debug else "Documentation disabled in production"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.environment}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )