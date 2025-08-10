import sys
import os
from pathlib import Path

from models.utilisateurs import Utilisateur

# Ajouter la racine du projet au chemin Python
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from database.database import SessionLocal, engine

# Importer tous les modèles pour s'assurer qu'ils sont bien enregistrés

def check_database():
    """Vérifier la base de données et afficher les utilisateurs"""
    print("🔄 Importation des modèles...")
    
    try:
        # Importer après l'import du package models
        print("✅ Tous les modèles importés avec succès")
    except Exception as e:
        print(f"⚠️ Erreur d'importation des modèles: {e}")
        return False
    
    print("🚀 Vérification de la base de données...")
    
    db = SessionLocal()
    try:
        print("🔍 Vérification de la base de données...")
        
        # Vérifier les tables disponibles
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📋 Tables disponibles : {tables}")
        
        if 'utilisateurs' in tables:
            print("✅ Table utilisateurs trouvée")
            
            # Interroger les utilisateurs
            utilisateurs = db.query(Utilisateur).all()
            print(f"👥 Nombre d'utilisateurs : {len(utilisateurs)}")
            
            for user in utilisateurs:
                print(f"  - ID: {user.id}, Email: {user.email}")
                
        else:
            print("❌ Table utilisateurs non trouvée")
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification : {e}")
        return False
    finally:
        db.close()
    
    return True

def menu():
    """Menu interactif"""
    while True:
        print("\n" + "="*50)
        print("Options disponibles :")
        print("1. Vérifier à nouveau")
        print("2. Supprimer tous les utilisateurs")
        print("3. Quitter")
        
        choix = input("Votre choix (1/2/3): ").strip()
        
        if choix == "1":
            check_database()
        elif choix == "2":
            delete_all_users()
        elif choix == "3":
            print("👋 Au revoir !")
            break
        else:
            print("❌ Choix invalide. Veuillez entrer 1, 2 ou 3.")

def delete_all_users():
    """Supprimer tous les utilisateurs"""
    from models.utilisateurs import Utilisateur
    
    db = SessionLocal()
    try:
        count = db.query(Utilisateur).count()
        if count == 0:
            print("ℹ️ Aucun utilisateur à supprimer")
            return
            
        confirmation = input(f"⚠️ Êtes-vous sûr de vouloir supprimer {count} utilisateur(s) ? (oui/non): ")
        if confirmation.lower() in ['oui', 'o', 'yes', 'y']:
            db.query(Utilisateur).delete()
            db.commit()
            print(f"✅ {count} utilisateur(s) supprimé(s)")
        else:
            print("❌ Suppression annulée")
            
    except Exception as e:
        print(f"❌ Erreur lors de la suppression : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Vérification initiale de la base de données...")
    if check_database():
        menu()
    else:
        print("❌ Impossible de continuer à cause d'erreurs")