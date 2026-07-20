// ============================================
// EspaceFormateur.jsx — Dashboard formateur
// Statistiques, cours, messages et profil
// ============================================

import { useState, useEffect } from 'react'
import api from '../services/api'
import './espaceFormateur.css'

function EspaceFormateur({ user, onRetour }) {

  const [stats, setStats]           = useState(null)
  const [mesCours, setMesCours]     = useState([])
  const [messages, setMessages]     = useState([])
  const [profil, setProfil]         = useState(null)
  const [onglet, setOnglet]         = useState('dashboard')
  const [loading, setLoading]       = useState(true)
  const [message, setMessage]       = useState({ type: '', texte: '' })

  const [dataProfil, setDataProfil] = useState({
    titreProfessionnel: '',
    specialites:        '',
    experienceAnnees:   '',
    siteWeb:            '',
    linkedin:           '',
    github:             ''
  })

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = () => {
    setLoading(true)
    Promise.all([
      api.get('/cours/formateur/' + user.id),
      api.get('/formateurs/' + user.id + '/statistiques'),
      api.get('/formateurs/' + user.id + '/messages'),
    ])
      .then(([coursRes, statsRes, messagesRes]) => {
        setMesCours(coursRes.data)
        setStats(statsRes.data)
        setMessages(messagesRes.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    api.get('/formateurs/' + user.id + '/profil')
      .then(res => {
        setProfil(res.data)
        setDataProfil({
          titreProfessionnel: res.data.titreProfessionnel || '',
          specialites:        res.data.specialites || '',
          experienceAnnees:   res.data.experienceAnnees || '',
          siteWeb:            res.data.siteWeb || '',
          linkedin:           res.data.linkedin || '',
          github:             res.data.github || ''
        })
      })
      .catch(() => {})
  }

  const detectChange = (e) => {
    const { name, value } = e.target
    setDataProfil(a => ({ ...a, [name]: value }))
  }

  const sauvegarderProfil = (e) => {
    e.preventDefault()
    api.post('/formateurs/' + user.id + '/profil', dataProfil)
      .then(() => {
        setMessage({ type: 'success', texte: 'Profil mis a jour avec succes !' })
        chargerDonnees()
      })
      .catch(() => setMessage({ type: 'error', texte: 'Erreur mise a jour profil !' }))
  }

  const marquerMessageLu = (idMessage) => {
    api.patch('/formateurs/messages/' + idMessage + '/lire')
      .then(() => chargerDonnees())
      .catch(() => {})
  }

  const togglePublication = (idCours) => {
    api.patch('/cours/' + idCours + '/publication')
      .then(() => chargerDonnees())
      .catch(() => setMessage({ type: 'error', texte: 'Erreur modification !' }))
  }

  const formaterDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="formateur-page">

      <div className="formateur-header">
        <div className="formateur-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-chalkboard'></i>
              Espace Formateur
            </h1>
            <p>Bienvenue, {user.prenom} {user.nom}</p>
          </div>
        </div>
      </div>

      <div className="formateur-container">

        <div className="formateur-layout">

          {/* ── SIDEBAR ── */}
          <div className="formateur-sidebar">
            <div className="sidebar-avatar">
              <i className='bx bx-user'></i>
            </div>
            <h3>{user.prenom} {user.nom}</h3>
            <p>{profil && profil.titreProfessionnel}</p>

            <nav className="sidebar-nav">
              <button
                className={'nav-item ' + (onglet === 'dashboard' ? 'active' : '')}
                onClick={() => setOnglet('dashboard')}
              >
                <i className='bx bx-grid-alt'></i>
                Dashboard
              </button>
              <button
                className={'nav-item ' + (onglet === 'mes-cours' ? 'active' : '')}
                onClick={() => setOnglet('mes-cours')}
              >
                <i className='bx bx-book'></i>
                Mes cours
                {mesCours.length > 0 && (
                  <span className="nav-badge">{mesCours.length}</span>
                )}
              </button>
              <button
                className={'nav-item ' + (onglet === 'messages' ? 'active' : '')}
                onClick={() => setOnglet('messages')}
              >
                <i className='bx bx-message'></i>
                Messages
                {messages.filter(m => !m.estLu).length > 0 && (
                  <span className="nav-badge">
                    {messages.filter(m => !m.estLu).length}
                  </span>
                )}
              </button>
              <button
                className={'nav-item ' + (onglet === 'profil' ? 'active' : '')}
                onClick={() => setOnglet('profil')}
              >
                <i className='bx bx-user-circle'></i>
                Mon profil
              </button>
            </nav>
          </div>

          {/* ── CONTENU PRINCIPAL ── */}
          <div className="formateur-main">

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
                  Vue d ensemble
                </h2>

                <div className="stats-grid">
                  <div className="stat-card stat-violet">
                    <div className="stat-icon">
                      <i className='bx bx-book'></i>
                    </div>
                    <div className="stat-info">
                      <h3>{stats?.totalCours || 0}</h3>
                      <p>Total cours</p>
                    </div>
                  </div>
                  <div className="stat-card stat-vert">
                    <div className="stat-icon">
                      <i className='bx bx-user'></i>
                    </div>
                    <div className="stat-info">
                      <h3>{stats?.totalApprenants || 0}</h3>
                      <p>Apprenants</p>
                    </div>
                  </div>
                  <div className="stat-card stat-bleu">
                    <div className="stat-icon">
                      <i className='bx bx-globe'></i>
                    </div>
                    <div className="stat-info">
                      <h3>{stats?.coursPublies || 0}</h3>
                      <p>Cours publiés</p>
                    </div>
                  </div>
                  <div className="stat-card stat-orange">
                    <div className="stat-icon">
                      <i className='bx bx-message'></i>
                    </div>
                    <div className="stat-info">
                      <h3>{messages.filter(m => !m.estLu).length}</h3>
                      <p>Messages non lus</p>
                    </div>
                  </div>
                </div>

                {/* Cours récents */}
                <h3 className="sous-titre">Cours récents</h3>
                <div className="cours-recents">
                  {mesCours.slice(0, 3).map(c => (
                    <div key={c.idCours} className="cours-recent-item">
                      <div className="cours-recent-icon">
                        <i className='bx bx-book-open'></i>
                      </div>
                      <div className="cours-recent-info">
                        <h4>{c.titre}</h4>
                        <span>{c.niveau}</span>
                      </div>
                      <span className={'statut-pill ' + (c.estPublie ? 'publie' : 'brouillon')}>
                        {c.estPublie ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MES COURS ── */}
            {!loading && onglet === 'mes-cours' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-book'></i>
                  Mes cours ({mesCours.length})
                </h2>

                {mesCours.length === 0 ? (
                  <div className="empty-state">
                    <i className='bx bx-book-add'></i>
                    <h3>Aucun cours créé</h3>
                    <p>Commencez par créer votre premier cours</p>
                  </div>
                ) : (
                  <div className="cours-table">
                    {mesCours.map(c => (
                      <div key={c.idCours} className="cours-table-row">
                        <div className="cours-table-info">
                          <h4>{c.titre}</h4>
                          <div className="cours-table-meta">
                            <span className={'niveau-badge niveau-' + c.niveau}>
                              {c.niveau}
                            </span>
                            <span>
                              <i className='bx bx-money'></i>
                              {c.prix > 0 ? c.prix + ' GNF' : 'Gratuit'}
                            </span>
                            {c.dureeEstimee && (
                              <span>
                                <i className='bx bx-time'></i>
                                {c.dureeEstimee} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="cours-table-actions">
                          <span className={'statut-pill ' + (c.estPublie ? 'publie' : 'brouillon')}>
                            {c.estPublie ? 'Publié' : 'Brouillon'}
                          </span>
                          <button
                            className={'btn-toggle ' + (c.estPublie ? 'depublier' : 'publier')}
                            onClick={() => togglePublication(c.idCours)}
                          >
                            <i className={'bx ' + (c.estPublie ? 'bx-hide' : 'bx-show')}></i>
                            {c.estPublie ? 'Dépublier' : 'Publier'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MESSAGES ── */}
            {!loading && onglet === 'messages' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-message'></i>
                  Messages ({messages.length})
                </h2>

                {messages.length === 0 ? (
                  <div className="empty-state">
                    <i className='bx bx-message'></i>
                    <h3>Aucun message</h3>
                  </div>
                ) : (
                  <div className="messages-liste">
                    {messages.map(msg => (
                      <div
                        key={msg.idMessage}
                        className={'message-item ' + (!msg.estLu ? 'non-lu' : '')}
                      >
                        <div className="message-avatar">
                          <i className='bx bx-user'></i>
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <strong>
                              {msg.expediteur && msg.expediteur.prenom + ' ' + msg.expediteur.nom}
                            </strong>
                            <span className="message-date">{formaterDate(msg.dateEnvoi)}</span>
                          </div>
                          {msg.sujet && (
                            <p className="message-sujet">{msg.sujet}</p>
                          )}
                          <p className="message-texte">{msg.contenu}</p>
                        </div>
                        {!msg.estLu && (
                          <button
                            className="btn-lire"
                            onClick={() => marquerMessageLu(msg.idMessage)}
                          >
                            <i className='bx bx-check'></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFIL ── */}
            {!loading && onglet === 'profil' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-user-circle'></i>
                  Mon profil formateur
                </h2>

                <form onSubmit={sauvegarderProfil} className="profil-form">

                  <div className="form-group">
                    <label>Titre professionnel</label>
                    <div className="input-wrapper">
                      <i className='bx bx-briefcase'></i>
                      <input
                        type="text"
                        name="titreProfessionnel"
                        value={dataProfil.titreProfessionnel}
                        onChange={detectChange}
                        placeholder="Ex: Développeur Full Stack Senior"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Spécialités</label>
                    <textarea
                      name="specialites"
                      value={dataProfil.specialites}
                      onChange={detectChange}
                      placeholder="Ex: React, Spring Boot, MariaDB..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Années d expérience</label>
                    <div className="input-wrapper">
                      <i className='bx bx-time'></i>
                      <input
                        type="number"
                        name="experienceAnnees"
                        value={dataProfil.experienceAnnees}
                        onChange={detectChange}
                        placeholder="Ex: 5"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Site web</label>
                      <div className="input-wrapper">
                        <i className='bx bx-globe'></i>
                        <input
                          type="text"
                          name="siteWeb"
                          value={dataProfil.siteWeb}
                          onChange={detectChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <div className="input-wrapper">
                        <i className='bx bxl-linkedin'></i>
                        <input
                          type="text"
                          name="linkedin"
                          value={dataProfil.linkedin}
                          onChange={detectChange}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>GitHub</label>
                    <div className="input-wrapper">
                      <i className='bx bxl-github'></i>
                      <input
                        type="text"
                        name="github"
                        value={dataProfil.github}
                        onChange={detectChange}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-sauvegarder">
                    <i className='bx bx-save'></i>
                    Sauvegarder le profil
                  </button>

                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default EspaceFormateur