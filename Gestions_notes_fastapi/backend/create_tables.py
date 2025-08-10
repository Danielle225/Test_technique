# create_tables.py
import sys
import os

# Ajouter le répertoire courant au Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database.database import Base, engine
    from models.utilisateurs import Utilisateur
    
    # Importez TOUS vos modèles ici - c'est CRITIQUE
    print("🔄 Importation des modèles...")
    
    # Essayer d'importer tous les modèles possibles
    try:
        from models.notes import Note
        print("✅ Modèle Note importé")
    except ImportError as e:
        print(f"⚠️  Modèle Note non trouvé: {e}")
    
    try:
        from models.partage_note import PartageNote
        print("✅ Modèle PartageNote importé")
    except ImportError as e:
        print(f"⚠️  Modèle PartageNote non trouvé: {e}")
    
    try:
        from models.tag import Tag
        print("✅ Modèle Tag importé")
    except ImportError as e:
        print(f"⚠️  Modèle Tag non trouvé: {e}")
    
    try:
        from models.tag import Tag
        print("✅ Modèle Tag importé")
    except ImportError as e:
        print(f"⚠️  Modèle NoteTag non trouvé: {e}")
    
    # Ou si vous avez un fichier qui importe tout
    try:
        from models import *
        print("✅ Tous les modèles importés via models.__init__")
    except ImportError as e:
        print(f"⚠️  Import global des modèles échoué: {e}")
    
    print("🔄 Importation des modèles terminée...")
except ImportError as e:
    print(f"❌ Erreur d'importation : {e}")
    print("Vérifiez que tous vos fichiers de modèles et de base de données existent.")
    sys.exit(1)

def create_all_tables():
    """Créer toutes les tables dans la base de données"""
    try:
        print("🔄 Création des tables en cours...")
        
        # Afficher tous les modèles qui seront créés
        print("📋 Modèles détectés:")
        for table_name, table in Base.metadata.tables.items():
            print(f"  - {table_name}")
            
        # Créer toutes les tables
        Base.metadata.create_all(bind=engine)
        print("✅ Toutes les tables ont été créées avec succès !")
        
        # Vérifier que les tables existent
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if tables:
            print(f"📋 Tables créées dans la DB : {tables}")
        else:
            print("⚠️  Aucune table trouvée. Vérifiez vos modèles.")
            
        # Test de connexion simple
        from database.database import SessionLocal
        db = SessionLocal()
        try:
            # Essayer une requête simple pour vérifier que tout fonctionne
            result = db.execute("SELECT name FROM sqlite_master WHERE type='table';")
            db_tables = [row[0] for row in result.fetchall()]
            print(f"🔍 Tables dans la base de données : {db_tables}")
            
            # Vérifier spécifiquement la table utilisateurs
            if 'utilisateurs' in db_tables:
                print("✅ Table 'utilisateurs' créée avec succès !")
            else:
                print("❌ Table 'utilisateurs' non trouvée !")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables : {e}")
        print(f"Type d'erreur : {type(e).__name__}")
        
        # Afficher plus de détails sur l'erreur
        if "Foreign key" in str(e):
            print("\n🔍 Problème de clé étrangère détecté !")
            print("Vérifiez que tous vos modèles sont importés dans le bon ordre.")
            print("Les modèles référencés par des clés étrangères doivent être importés en premier.")
            
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Démarrage du script de création des tables...")
    create_all_tables()
    print("✅ Script terminé.")