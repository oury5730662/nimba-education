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

  // ── Certificats en attente de validation ──
  const [certificatsEnAttente, setCertificatsEnAttente] = useState([])
  const [refusEnCoursId, setRefusEnCoursId]             = useState(null)
  const [commentaireRefus, setCommentaireRefus]         = useState('')
  const [traitementEnCours, setTraitementEnCours]       = useState(false)

  // ── Inscrits à un cours (modale) ──
  const [coursInscritsId, setCoursInscritsId] = useState(null)
  const [inscrits, setInscrits]               = useState([])
  const [loadingInscrits, setLoadingInscrits] = useState(false)

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
      api.get('/certificats/en-attente/' + user.id),
    ])
      .then(([coursRes, statsRes, messagesRes, certificatsRes]) => {
        setMesCours(coursRes.data)
        setStats(statsRes.data)
        setMessages(messagesRes.data)
        setCertificatsEnAttente(certificatsRes.data)
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

  const supprimerCours = (cours) => {
    const confirme = window.confirm(
      'Supprimer définitivement le cours "' + cours.titre + '" ? Cette action est irréversible.'
    )
    if (!confirme) return

    api.delete('/cours/' + cours.idCours + '?idFormateur=' + user.id)
      .then(() => {
        setMessage({ type: 'success', texte: 'Cours supprimé avec succès.' })
        chargerDonnees()
      })
      .catch(err => {
        setMessage({
          type: 'error',
          texte: err.response?.data?.erreur || 'Erreur lors de la suppression du cours !'
        })
      })
  }

  const voirInscrits = (idCours) => {
    setCoursInscritsId(idCours)
    setInscrits([])
    setLoadingInscrits(true)
    api.get('/inscriptions/cours/' + idCours)
      .then(res => {
        setInscrits(res.data)
        setLoadingInscrits(false)
      })
      .catch(() => {
        setLoadingInscrits(false)
        setMessage({ type: 'error', texte: 'Erreur lors du chargement des inscrits !' })
      })
  }

  const fermerInscrits = () => {
    setCoursInscritsId(null)
    setInscrits([])
  }

  // ── Valider / refuser une demande de certificat ──
  const validerCertificat = (idCertificat) => {
    if (traitementEnCours) return
    setTraitementEnCours(true)
    api.patch('/certificats/' + idCertificat + '/valider?idFormateur=' + user.id)
      .then(() => {
        setTraitementEnCours(false)
        setMessage({ type: 'success', texte: 'Certificat validé et délivré à l apprenant !' })
        chargerDonnees()
      })
      .catch(err => {
        setTraitementEnCours(false)
        setMessage({ type: 'error', texte: err.response?.data?.erreur || 'Erreur lors de la validation !' })
      })
  }

  const confirmerRefusCertificat = (idCertificat) => {
    if (traitementEnCours) return
    setTraitementEnCours(true)
    api.patch('/certificats/' + idCertificat + '/refuser?idFormateur=' + user.id, { commentaire: commentaireRefus })
      .then(() => {
        setTraitementEnCours(false)
        setRefusEnCoursId(null)
        setCommentaireRefus('')
        setMessage({ type: 'success', texte: 'Demande de certificat refusée.' })
        chargerDonnees()
      })
      .catch(err => {
        setTraitementEnCours(false)
        setMessage({ type: 'error', texte: err.response?.data?.erreur || 'Erreur lors du refus !' })
      })
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
                className={'nav-item ' + (onglet === 'certificats' ? 'active' : '')}
                onClick={() => setOnglet('certificats')}
              >
                <i className='bx bx-certification'></i>
                Certificats à valider
                {certificatsEnAttente.length > 0 && (
                  <span className="nav-badge">{certificatsEnAttente.length}</span>
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
                            className="btn-toggle btn-inscrits"
                            onClick={() => voirInscrits(c.idCours)}
                          >
                            <i className='bx bx-group'></i>
                            Voir les inscrits
                          </button>
                          <button
                            className={'btn-toggle ' + (c.estPublie ? 'depublier' : 'publier')}
                            onClick={() => togglePublication(c.idCours)}
                          >
                            <i className={'bx ' + (c.estPublie ? 'bx-hide' : 'bx-show')}></i>
                            {c.estPublie ? 'Dépublier' : 'Publier'}
                          </button>
                          <button
                            className="btn-supprimer"
                            onClick={() => supprimerCours(c)}
                            title="Supprimer le cours"
                          >
                            <i className='bx bx-trash'></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MODALE : INSCRITS À UN COURS ── */}
            {coursInscritsId !== null && (
              <div className="modal-overlay" onClick={fermerInscrits}>
                <div className="modal-inscrits" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-inscrits-header">
                    <h3>
                      <i className='bx bx-group'></i>
                      Apprenants inscrits ({inscrits.length})
                    </h3>
                    <button className="modal-close" onClick={fermerInscrits}>
                      <i className='bx bx-x'></i>
                    </button>
                  </div>

                  {loadingInscrits ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                      <p>Chargement...</p>
                    </div>
                  ) : inscrits.length === 0 ? (
                    <div className="empty-state">
                      <i className='bx bx-user-x'></i>
                      <h3>Aucun apprenant inscrit</h3>
                      <p>Les apprenants inscrits à ce cours apparaîtront ici</p>
                    </div>
                  ) : (
                    <div className="inscrits-liste">
                      {inscrits.map(insc => (
                        <div key={insc.idUtilisateur} className="inscrit-item">
                          <div className="inscrit-avatar">
                            <i className='bx bx-user'></i>
                          </div>
                          <div className="inscrit-info">
                            <h4>{insc.prenom} {insc.nom}</h4>
                            <span className="inscrit-email">{insc.email}</span>
                            <span className="inscrit-date">
                              <i className='bx bx-calendar'></i>
                              Inscrit le {formaterDate(insc.dateInscription)}
                            </span>
                          </div>
                          <div className="inscrit-progression">
                            <div className="progression-barre">
                              <div
                                className="progression-remplissage"
                                style={{ width: Math.round(insc.pourcentageProgression) + '%' }}
                              ></div>
                            </div>
                            <span>{Math.round(insc.pourcentageProgression)}%</span>
                          </div>
                          <span className={'statut-pill ' + (insc.statut === 'termine' ? 'publie' : 'brouillon')}>
                            {insc.statut === 'termine' ? 'Terminé' : 'En cours'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

            {/* ── CERTIFICATS À VALIDER ── */}
            {!loading && onglet === 'certificats' && (
              <div>
                <h2 className="section-title">
                  <i className='bx bx-certification'></i>
                  Certificats à valider ({certificatsEnAttente.length})
                </h2>

                {certificatsEnAttente.length === 0 ? (
                  <div className="empty-state">
                    <i className='bx bx-certification'></i>
                    <h3>Aucune demande en attente</h3>
                    <p>Les demandes de certificat de vos apprenants apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="certificats-attente-liste">
                    {certificatsEnAttente.map(cert => (
                      <div key={cert.idCertificat} className="certificat-attente-item">
                        <div className="certificat-attente-info">
                          <h4>
                            {cert.utilisateur?.prenom} {cert.utilisateur?.nom}
                          </h4>
                          <p>{cert.cours?.titre}</p>
                          <div className="certificat-attente-meta">
                            <span>
                              <i className='bx bx-target-lock'></i>
                              Note quiz final : {Math.round(cert.scoreFinal || 0)}/100
                            </span>
                            <span>
                              <i className='bx bx-calendar'></i>
                              Demandé le {formaterDate(cert.dateEmission)}
                            </span>
                          </div>
                        </div>

                        {refusEnCoursId === cert.idCertificat ? (
                          <div className="certificat-attente-refus">
                            <textarea
                              value={commentaireRefus}
                              onChange={(e) => setCommentaireRefus(e.target.value)}
                              placeholder="Motif du refus (optionnel)..."
                              rows={2}
                            />
                            <div className="certificat-attente-refus-actions">
                              <button
                                className="btn-annuler"
                                onClick={() => { setRefusEnCoursId(null); setCommentaireRefus('') }}
                              >
                                Annuler
                              </button>
                              <button
                                className="btn-confirmer-refus"
                                disabled={traitementEnCours}
                                onClick={() => confirmerRefusCertificat(cert.idCertificat)}
                              >
                                Confirmer le refus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="certificat-attente-actions">
                            <button
                              className="btn-refuser"
                              disabled={traitementEnCours}
                              onClick={() => { setRefusEnCoursId(cert.idCertificat); setCommentaireRefus('') }}
                            >
                              <i className='bx bx-x'></i>
                              Refuser
                            </button>
                            <button
                              className="btn-valider"
                              disabled={traitementEnCours}
                              onClick={() => validerCertificat(cert.idCertificat)}
                            >
                              <i className='bx bx-check'></i>
                              Valider
                            </button>
                          </div>
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