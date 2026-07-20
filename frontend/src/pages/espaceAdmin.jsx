// ============================================
// EspaceAdmin.jsx — Dashboard administrateur
// Statistiques globales, utilisateurs et catégories
// ============================================

import { useState, useEffect } from 'react'
import api from '../services/api'
import './espaceAdmin.css'

function EspaceAdmin({ user, onRetour }) {

  const [stats, setStats]         = useState(null)
  const [utilisateurs, setUtilisateurs] = useState([])
  const [categories, setCategories]     = useState([])
  const [onglet, setOnglet]       = useState('dashboard')
  const [loading, setLoading]     = useState(true)
  const [message, setMessage]     = useState({ type: '', texte: '' })
  const [filtreRole, setFiltreRole] = useState('tous')

  const [idCategorieEnEdition, setIdCategorieEnEdition] = useState(null)
  const [dataCategorie, setDataCategorie] = useState({
    nom: '', description: '', couleur: '#4F46E5'
  })

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/statistiques'),
      api.get('/admin/utilisateurs'),
      api.get('/categories'),
    ])
      .then(([statsRes, usersRes, catRes]) => {
        setStats(statsRes.data)
        setUtilisateurs(usersRes.data)
        setCategories(catRes.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const utilisateursFiltres = utilisateurs.filter(u =>
    filtreRole === 'tous' || u.role === filtreRole
  )

  const bloquer = (idUtilisateur) => {
    api.patch('/admin/utilisateurs/' + idUtilisateur + '/bloquer')
      .then(() => {
        setMessage({ type: 'success', texte: 'Compte bloqué avec succès.' })
        chargerDonnees()
      })
      .catch(err => setMessage({
        type: 'error',
        texte: err.response?.data?.erreur || 'Erreur lors du blocage !'
      }))
  }

  const debloquer = (idUtilisateur) => {
    api.patch('/admin/utilisateurs/' + idUtilisateur + '/debloquer')
      .then(() => {
        setMessage({ type: 'success', texte: 'Compte débloqué avec succès.' })
        chargerDonnees()
      })
      .catch(err => setMessage({
        type: 'error',
        texte: err.response?.data?.erreur || 'Erreur lors du déblocage !'
      }))
  }

  const detectChangeCategorie = (e) => {
    const { name, value } = e.target
    setDataCategorie(a => ({ ...a, [name]: value }))
  }

  const commencerEdition = (cat) => {
    setIdCategorieEnEdition(cat.idCategorie)
    setDataCategorie({
      nom: cat.nom || '',
      description: cat.description || '',
      couleur: cat.couleur || '#4F46E5'
    })
  }

  const annulerEdition = () => {
    setIdCategorieEnEdition(null)
    setDataCategorie({ nom: '', description: '', couleur: '#4F46E5' })
  }

  const soumettreCategorie = (e) => {
    e.preventDefault()
    const requete = idCategorieEnEdition
      ? api.put('/categories/' + idCategorieEnEdition, dataCategorie)
      : api.post('/categories', dataCategorie)

    requete
      .then(() => {
        setMessage({
          type: 'success',
          texte: idCategorieEnEdition ? 'Catégorie modifiée avec succès.' : 'Catégorie créée avec succès.'
        })
        annulerEdition()
        chargerDonnees()
      })
      .catch(err => setMessage({
        type: 'error',
        texte: err.response?.data?.erreur || 'Erreur lors de l enregistrement de la catégorie !'
      }))
  }

  const supprimerCategorie = (cat) => {
    const confirme = window.confirm(
      'Supprimer la catégorie "' + cat.nom + '" ? Les cours associés perdront leur catégorie.'
    )
    if (!confirme) return

    api.delete('/categories/' + cat.idCategorie)
      .then(() => {
        setMessage({ type: 'success', texte: 'Catégorie supprimée avec succès.' })
        chargerDonnees()
      })
      .catch(err => setMessage({
        type: 'error',
        texte: err.response?.data?.erreur || 'Erreur lors de la suppression de la catégorie !'
      }))
  }

  return (
    <div className="admin-page">

      <div className="admin-header">
        <div className="admin-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-shield-quarter'></i>
              Espace Administrateur
            </h1>
            <p>Bienvenue, {user.prenom} {user.nom}</p>
          </div>
        </div>
      </div>

      <div className="admin-container">

        <div className="admin-layout">

          {/* ── SIDEBAR ── */}
          <div className="admin-sidebar">
            <div className="sidebar-avatar">
              <i className='bx bx-shield'></i>
            </div>
            <h3>{user.prenom} {user.nom}</h3>
            <p>Administrateur</p>

            <nav className="sidebar-nav">
              <button
                className={'nav-item ' + (onglet === 'dashboard' ? 'active' : '')}
                onClick={() => setOnglet('dashboard')}
              >
                <i className='bx bx-grid-alt'></i>
                Dashboard
              </button>
              <button
                className={'nav-item ' + (onglet === 'utilisateurs' ? 'active' : '')}
                onClick={() => setOnglet('utilisateurs')}
              >
                <i className='bx bx-user'></i>
                Utilisateurs
                {utilisateurs.length > 0 && (
                  <span className="nav-badge">{utilisateurs.length}</span>
                )}
              </button>
              <button
                className={'nav-item ' + (onglet === 'categories' ? 'active' : '')}
                onClick={() => setOnglet('categories')}
              >
                <i className='bx bx-category'></i>
                Catégories
                {categories.length > 0 && (
                  <span className="nav-badge">{categories.length}</span>
                )}
              </button>
            </nav>
          </div>

          {/* ── CONTENU PRINCIPAL ── */}
          <div className="admin-main">

            {message.texte && (
              <div className={'alert alert-' + (message.type === 'error' ? 'error' : 'success')}>
                <i className={'bx ' + (message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle')}></i>
                {message.texte}
                <button onClick={() => setMessage({ type: '', texte: '' })}>
                  <i className='bx bx-x'></i>
                </button>
              </div>
            )}

            {loading && (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
              </div>
            )}

            {/* ── DASHBOARD ── */}
            {!loading && onglet === 'dashboard' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-grid-alt'></i>
                  Vue d ensemble de la plateforme
                </h2>

                <div className="stats-grid">
                  <div className="stat-card stat-violet">
                    <div className="stat-icon"><i className='bx bx-group'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.totalUtilisateurs || 0}</h3>
                      <p>Utilisateurs</p>
                    </div>
                  </div>
                  <div className="stat-card stat-bleu">
                    <div className="stat-icon"><i className='bx bx-chalkboard'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.totalFormateurs || 0}</h3>
                      <p>Formateurs</p>
                    </div>
                  </div>
                  <div className="stat-card stat-vert">
                    <div className="stat-icon"><i className='bx bx-user'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.totalApprenants || 0}</h3>
                      <p>Apprenants</p>
                    </div>
                  </div>
                  <div className="stat-card stat-orange">
                    <div className="stat-icon"><i className='bx bx-book'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.totalCours || 0}</h3>
                      <p>Total cours</p>
                    </div>
                  </div>
                  <div className="stat-card stat-violet">
                    <div className="stat-icon"><i className='bx bx-globe'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.coursPublies || 0}</h3>
                      <p>Cours publiés</p>
                    </div>
                  </div>
                  <div className="stat-card stat-bleu">
                    <div className="stat-icon"><i className='bx bx-certification'></i></div>
                    <div className="stat-info">
                      <h3>{stats?.certificatsDelivres || 0}</h3>
                      <p>Certificats délivrés</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {!loading && onglet === 'utilisateurs' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-user'></i>
                  Utilisateurs ({utilisateursFiltres.length})
                </h2>

                <div className="filtres-role">
                  <button
                    className={'filtre-role-btn ' + (filtreRole === 'tous' ? 'active' : '')}
                    onClick={() => setFiltreRole('tous')}
                  >
                    Tous
                  </button>
                  <button
                    className={'filtre-role-btn ' + (filtreRole === 'apprenant' ? 'active' : '')}
                    onClick={() => setFiltreRole('apprenant')}
                  >
                    Apprenants
                  </button>
                  <button
                    className={'filtre-role-btn ' + (filtreRole === 'formateur' ? 'active' : '')}
                    onClick={() => setFiltreRole('formateur')}
                  >
                    Formateurs
                  </button>
                  <button
                    className={'filtre-role-btn ' + (filtreRole === 'admin' ? 'active' : '')}
                    onClick={() => setFiltreRole('admin')}
                  >
                    Admins
                  </button>
                </div>

                {utilisateursFiltres.length === 0 ? (
                  <div className="empty-state">
                    <i className='bx bx-user-x'></i>
                    <h3>Aucun utilisateur trouvé</h3>
                  </div>
                ) : (
                  <div className="utilisateurs-table">
                    <div className="utilisateurs-table-header">
                      <span>Nom</span>
                      <span>Email</span>
                      <span>Rôle</span>
                      <span>Statut</span>
                      <span></span>
                    </div>
                    {utilisateursFiltres.map(u => (
                      <div key={u.idUtilisateur} className="utilisateurs-table-row">
                        <span className="cell-nom">{u.prenom} {u.nom}</span>
                        <span className="cell-email">{u.email}</span>
                        <span>
                          <span className={'role-badge role-' + u.role}>{u.role}</span>
                        </span>
                        <span>
                          <span className={'statut-pill ' + (u.estActif ? 'publie' : 'brouillon')}>
                            {u.estActif ? 'Actif' : 'Bloqué'}
                          </span>
                        </span>
                        <span>
                          {u.estActif ? (
                            <button className="btn-toggle depublier" onClick={() => bloquer(u.idUtilisateur)}>
                              <i className='bx bx-lock-alt'></i>
                              Bloquer
                            </button>
                          ) : (
                            <button className="btn-toggle publier" onClick={() => debloquer(u.idUtilisateur)}>
                              <i className='bx bx-lock-open-alt'></i>
                              Débloquer
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CATÉGORIES ── */}
            {!loading && onglet === 'categories' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-category'></i>
                  Catégories ({categories.length})
                </h2>

                <form onSubmit={soumettreCategorie} className="categorie-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom de la catégorie</label>
                      <div className="input-wrapper">
                        <i className='bx bx-tag'></i>
                        <input
                          type="text"
                          name="nom"
                          value={dataCategorie.nom}
                          onChange={detectChangeCategorie}
                          placeholder="Ex: Développement Web"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group form-group-couleur">
                      <label>Couleur</label>
                      <input
                        type="color"
                        name="couleur"
                        value={dataCategorie.couleur}
                        onChange={detectChangeCategorie}
                        className="input-couleur"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={dataCategorie.description}
                      onChange={detectChangeCategorie}
                      placeholder="Description de la catégorie..."
                      rows={3}
                    />
                  </div>

                  <div className="categorie-form-actions">
                    {idCategorieEnEdition && (
                      <button type="button" className="btn-annuler" onClick={annulerEdition}>
                        Annuler
                      </button>
                    )}
                    <button type="submit" className="btn-sauvegarder">
                      <i className={'bx ' + (idCategorieEnEdition ? 'bx-save' : 'bx-plus')}></i>
                      {idCategorieEnEdition ? 'Enregistrer les modifications' : 'Créer la catégorie'}
                    </button>
                  </div>
                </form>

                <h3 className="sous-titre">Catégories existantes</h3>

                {categories.length === 0 ? (
                  <div className="empty-state">
                    <i className='bx bx-category'></i>
                    <h3>Aucune catégorie créée</h3>
                  </div>
                ) : (
                  <div className="categories-liste">
                    {categories.map(cat => (
                      <div key={cat.idCategorie} className="categorie-item">
                        <div
                          className="categorie-couleur"
                          style={{ background: cat.couleur || '#4F46E5' }}
                        ></div>
                        <div className="categorie-info">
                          <h4>{cat.nom}</h4>
                          {cat.description && <p>{cat.description}</p>}
                        </div>
                        <div className="categorie-actions">
                          <button className="btn-modifier" onClick={() => commencerEdition(cat)}>
                            <i className='bx bx-edit'></i>
                          </button>
                          <button className="btn-supprimer" onClick={() => supprimerCategorie(cat)}>
                            <i className='bx bx-trash'></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default EspaceAdmin
