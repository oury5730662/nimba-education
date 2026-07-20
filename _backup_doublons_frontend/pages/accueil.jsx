import { useState, useEffect } from 'react'
import api from '../services/api'
import './accueil.css'

function Accueil({ user, onDeconnexion, allerCreerCours, allerRessources, allerQuiz, allerProgression, allerCertificats, allerEspaceFormateur }) {
  const [cours, setCours]           = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [recherche, setRecherche]   = useState('')
  const [categorieActive, setCategorieActive] = useState('tous')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [msgInscription, setMsgInscription] = useState('')
  const [erreurChargement, setErreurChargement] = useState('')

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = () => {
    setLoading(true)
    setErreurChargement('')
    Promise.all([api.get('/cours/publies'), api.get('/categories')])
      .then(([c, cat]) => {
        setCours(Array.isArray(c.data) ? c.data : [])
        setCategories(Array.isArray(cat.data) ? cat.data : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setErreurChargement('Impossible de charger les cours. Verifiez que le backend est demarre puis cliquez sur Actualiser.')
      })
  }

  const sInscrire = (idCours) => {
    api.post(`/progression/inscrire?idUtilisateur=${user.id}&idCours=${idCours}`)
      .then(() => { setMsgInscription('Inscription reussie !'); setTimeout(() => setMsgInscription(''), 3000) })
      .catch(err => { setMsgInscription(err.response?.data?.erreur || 'Erreur inscription'); setTimeout(() => setMsgInscription(''), 3000) })
  }

  const coursFiltres = cours.filter(c => {
    const matchR = c.titre.toLowerCase().includes(recherche.toLowerCase())
    const matchC = categorieActive === 'tous' || c.categorie?.idCategorie === parseInt(categorieActive)
    return matchR && matchC
  })

  const badgeNiveau = (n) => {
    const cfg = { debutant: { label: 'Debutant', cls: 'badge-vert' }, intermediaire: { label: 'Intermediaire', cls: 'badge-orange' }, avance: { label: 'Avance', cls: 'badge-rouge' } }
    return cfg[n] || { label: n, cls: 'badge-gris' }
  }

  return (
    <div className="accueil-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo"><i className='bx bx-book-open'></i><span>ODC E-Learning</span></div>
          <div className="navbar-search">
            <i className='bx bx-search'></i>
            <input type="text" placeholder="Rechercher un cours..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="navbar-actions">
            <button className="btn-refresh" onClick={chargerDonnees} title="Actualiser la liste des cours">
              <i className='bx bx-refresh'></i>
            </button>
            <div className="menu-wrapper">
              <button className="btn-menu" onClick={() => setMenuOuvert(!menuOuvert)}>
                <i className='bx bx-menu'></i> Menu <i className={`bx bx-chevron-${menuOuvert ? 'up' : 'down'}`}></i>
              </button>
              {menuOuvert && (
                <div className="dropdown-menu">
                  {user?.role === 'formateur' && <>
                    <button className="dropdown-item" onClick={() => { allerCreerCours(); setMenuOuvert(false) }}><i className='bx bx-book-add'></i>Creer un cours</button>
                    <button className="dropdown-item" onClick={() => { allerRessources(); setMenuOuvert(false) }}><i className='bx bx-video-plus'></i>Ajouter ressources</button>
                    <button className="dropdown-item" onClick={() => { allerQuiz(); setMenuOuvert(false) }}><i className='bx bx-question-mark'></i>Gerer les quiz</button>
                    <button className="dropdown-item" onClick={() => { allerEspaceFormateur(); setMenuOuvert(false) }}><i className='bx bx-chalkboard'></i>Mon espace</button>
                  </>}
                  {user?.role === 'apprenant' && <>
                    <button className="dropdown-item" onClick={() => { allerQuiz(); setMenuOuvert(false) }}><i className='bx bx-question-mark'></i>Mes quiz</button>
                    <button className="dropdown-item" onClick={() => { allerProgression(); setMenuOuvert(false) }}><i className='bx bx-trending-up'></i>Ma progression</button>
                    <button className="dropdown-item" onClick={() => { allerCertificats(); setMenuOuvert(false) }}><i className='bx bx-certification'></i>Mes certificats</button>
                  </>}
                </div>
              )}
            </div>
            <div className="user-info-nav">
              <div className="user-avatar"><i className='bx bx-user'></i></div>
              <div className="user-details">
                <span className="user-name">{user?.prenom} {user?.nom}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button className="btn-logout" onClick={onDeconnexion} title="Se deconnecter"><i className='bx bx-log-out'></i></button>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue, <span>{user?.prenom}</span> ! 👋</h1>
          <p>Decouvrez nos formations et developpez vos competences avec les meilleurs formateurs d ODC Guinee.</p>
          <div className="hero-stats">
            <div className="stat"><i className='bx bx-book'></i><strong>{cours.length}</strong><span>Cours disponibles</span></div>
            <div className="stat"><i className='bx bx-category'></i><strong>{categories.length}</strong><span>Categories</span></div>
            <div className="stat"><i className='bx bx-certification'></i><strong>{cours.filter(c => c.estCertifiant).length}</strong><span>Certifiants</span></div>
          </div>
        </div>
      </section>

      {msgInscription && <div style={{position:'fixed',top:'80px',right:'20px',padding:'12px 20px',background:'#D1FAE5',color:'#059669',borderRadius:'10px',fontWeight:'600',zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>{msgInscription}</div>}

      {erreurChargement && (
        <div style={{maxWidth:'1200px',margin:'16px auto 0',padding:'0 20px'}}>
          <div className="alert alert-error">
            <i className='bx bx-error-circle'></i>
            {erreurChargement}
            <button onClick={chargerDonnees} style={{marginLeft:'auto',background:'#DC2626',color:'white',padding:'6px 14px',borderRadius:'6px',fontWeight:'600',fontSize:'0.85rem'}}>Reessayer</button>
          </div>
        </div>
      )}

      <section className="filtres-section">
        <div className="filtres-container">
          <button className={'filtre-btn' + (categorieActive === 'tous' ? ' active' : '')} onClick={() => setCategorieActive('tous')}><i className='bx bx-grid-alt'></i>Tous</button>
          {categories.map(cat => (
            <button key={cat.idCategorie} className={'filtre-btn' + (categorieActive === cat.idCategorie.toString() ? ' active' : '')} onClick={() => setCategorieActive(cat.idCategorie.toString())}>{cat.nom}</button>
          ))}
        </div>
      </section>

      <section className="cours-section">
        <div className="cours-container">
          <div className="cours-header">
            <h2>Tous les cours <span className="cours-count">{coursFiltres.length} cours</span></h2>
          </div>
          {loading && <div className="loading"><div className="loading-spinner"></div><p>Chargement...</p></div>}
          {!loading && coursFiltres.length === 0 && <div className="empty-state"><i className='bx bx-search-alt'></i><h3>Aucun cours trouve</h3></div>}
          {!loading && coursFiltres.length > 0 && (
            <div className="cours-grid">
              {coursFiltres.map(c => (
                <div key={c.idCours} className="cours-card">
                  <div className="cours-image">
                    {c.imageCouverture ? <img src={c.imageCouverture} alt={c.titre} /> : <div className="cours-image-placeholder"><i className='bx bx-book-open'></i></div>}
                    {c.estCertifiant && <div className="badge-certifiant"><i className='bx bx-certification'></i>Certifiant</div>}
                  </div>
                  <div className="cours-body">
                    <div className="cours-meta">
                      <span className={'badge ' + badgeNiveau(c.niveau).cls}>{badgeNiveau(c.niveau).label}</span>
                      {c.categorie && <span className="cours-categorie">{c.categorie.nom}</span>}
                    </div>
                    <h3 className="cours-titre">{c.titre}</h3>
                    <p className="cours-description">{c.description ? c.description.substring(0, 90) + '...' : ''}</p>
                    <div className="cours-footer">
                      <div className="cours-infos">
                        {c.dureeEstimee && <span><i className='bx bx-time'></i>{c.dureeEstimee} min</span>}
                        <span><i className='bx bx-money'></i>{c.prix > 0 ? c.prix + ' GNF' : 'Gratuit'}</span>
                      </div>
                      {user?.role === 'apprenant' && (
                        <button className="btn-inscrire" onClick={() => sInscrire(c.idCours)}>
                          <i className='bx bx-log-in'></i>S inscrire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo"><i className='bx bx-book-open'></i><span>ODC E-Learning</span></div>
          <p>2026 ODC Guinee - Tous droits reserves</p>
        </div>
      </footer>
    </div>
  )
}

export default Accueil
