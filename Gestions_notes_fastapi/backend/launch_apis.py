"""
Script pour lancer les deux versions de l'API Notes
- Version 1: Port 8000 (Swagger standard)
- Version 2: Port 8001 (Swagger personnalisé)
"""
import subprocess
import sys
import time
import signal
import os
from typing import List

class APILauncher:
    def __init__(self):
        self.processes: List[subprocess.Popen] = []
    
    def start_api_v1(self):
        """Lancer l'API v1 sur le port 8000"""
        print(" Démarrage de l'API v1 (Port 8000)...")
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
        self.processes.append(process)
        return process
    
    def start_api_v2(self):
        """Lancer l'API v2 sur le port 8001"""
        print("🎨 Démarrage de l'API v2 (Port 8001)...")
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "main_v2:app_v2",
            "--host", "0.0.0.0", 
            "--port", "8001",
            "--reload"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
        self.processes.append(process)
        return process
    
    def stop_all(self):
        """Arrêter tous les processus"""
        print("\n Arrêt des serveurs...")
        for process in self.processes:
            process.terminate()
        
        # Attendre que les processus se terminent
        for process in self.processes:
            process.wait()
        
        print(" Tous les serveurs ont été arrêtés.")
    
    def signal_handler(self, signum, frame):
        """Gestionnaire de signaux pour arrêt propre"""
        self.stop_all()
        sys.exit(0)
    
    def launch_both(self):
        """Lancer les deux versions de l'API"""
        # Configurer le gestionnaire de signaux
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            # Démarrer les deux APIs
            self.start_api_v1()
            time.sleep(2)  # Attendre un peu avant de lancer la v2
            self.start_api_v2()
            
            print("\n" + "="*60)
            print("🎉 LES DEUX APIS SONT MAINTENANT ACTIVES!")
            print("="*60)
            print("\n📋 API v1 (Standard):")
            print("   🌐 URL: http://localhost:8000")
            print("   📚 Swagger: http://localhost:8000/docs")
            print("   📖 ReDoc: http://localhost:8000/redoc")
            
            print("\n🎨 API v2 (Personnalisée):")
            print("   🌐 URL: http://localhost:8001") 
            print("   📚 Swagger Personnalisé: http://localhost:8001/docs")
            print("   📖 ReDoc Personnalisé: http://localhost:8001/redoc")
            print("   🔧 Swagger Classique: http://localhost:8001/docs-classic")
            
            print("\n⚙️  COMMANDES UTILES:")
            print("   📋 Collection Postman: Notes_API_Postman_Collection.json")
            print("   🌍 Environnement Postman: Notes_API_Environment.postman_environment.json")
            
            print("\n❌ Pour arrêter: Ctrl+C")
            print("="*60)
            
            # Attendre indéfiniment
            while True:
                time.sleep(1)
                # Vérifier si les processus sont toujours actifs
                for i, process in enumerate(self.processes):
                    if process.poll() is not None:
                        print(f"⚠️  Le processus {i+1} s'est arrêté de manière inattendue.")
                        
        except KeyboardInterrupt:
            self.stop_all()
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.stop_all()

def main():
    """Point d'entrée principal"""
    print("🚀 LANCEUR DOUBLE API - Notes Management")
    print("="*50)
    
    launcher = APILauncher()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "v1":
            print("🚀 Lancement uniquement de l'API v1...")
            launcher.start_api_v1()
        elif command == "v2":
            print("🎨 Lancement uniquement de l'API v2...")
            launcher.start_api_v2()
        else:
            print("❌ Commande inconnue. Utilisez: 'v1', 'v2', ou aucun argument pour les deux.")
            return
            
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            launcher.stop_all()
    else:
        launcher.launch_both()

if __name__ == "__main__":
    main()
