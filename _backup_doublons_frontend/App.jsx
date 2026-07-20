import { useState, useEffect } from 'react'
import Accueil         from './pages/accueil'
import Connexion       from './pages/connexion'
import Inscription     from './pages/inscription'
import CreationCours   from './pages/creationCours'
import AjoutRessources from './pages/ajoutRessources'
import Quiz            from './pages/quiz'
import Progression     from './pages/progression'
import Certificats     from './pages/certificats'
import EspaceFormateur from './pages/espaceFormateur'
import './App.css'

function App() {
  const [page, setPage] = useState('connexion')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    const t = localStorage.getItem('token')
    if (u && t) { setUser(JSON.parse(u)); setPage('accueil') }
  }, [])

  const handleConnexion   = (u) => { setUser(u); setPage('accueil') }
  const handleInscription = (u) => { setUser(u); setPage('accueil') }
  const handleDeconnexion = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    setUser(null); setPage('connexion')
  }

  const nav = (p) => setPage(p)

  return (
    <div>
      {page === 'connexion'       && <Connexion onConnexion={handleConnexion} allerInscription={() => nav('inscription')} />}
      {page === 'inscription'     && <Inscription onInscription={handleInscription} allerConnexion={() => nav('connexion')} />}
      {page === 'accueil'         && <Accueil user={user} onDeconnexion={handleDeconnexion}
          allerCreerCours={() => nav('creation-cours')}
          allerRessources={() => nav('ajout-ressources')}
          allerQuiz={() => nav('quiz')}
          allerProgression={() => nav('progression')}
          allerCertificats={() => nav('certificats')}
          allerEspaceFormateur={() => nav('espace-formateur')}
          allerInscription={(idCours) => { nav('progression') }}
        />}
      {page === 'creation-cours'  && <CreationCours user={user} onRetour={() => nav('accueil')} />}
      {page === 'ajout-ressources'&& <AjoutRessources user={user} onRetour={() => nav('accueil')} />}
      {page === 'quiz'            && <Quiz user={user} onRetour={() => nav('accueil')} />}
      {page === 'progression'     && <Progression user={user} onRetour={() => nav('accueil')} />}
      {page === 'certificats'     && <Certificats user={user} onRetour={() => nav('accueil')} />}
      {page === 'espace-formateur'&& <EspaceFormateur user={user} onRetour={() => nav('accueil')} />}
    </div>
  )
}

export default App
