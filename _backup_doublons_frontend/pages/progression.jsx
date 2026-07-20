// ============================================
// Progression.jsx — Suivi de progression
// Permet à l'apprenant de voir sa progression
// dans chaque cours auquel il est inscrit
// ============================================

import { useState, useEffect } from 'react'
import api from '../services/api'
import './progression.css'

function Progression({ user, onRetour }) {

  // ── États ────────────────────────────────
  const [inscriptions, setInscriptions] = useState([])
  const [progressions, setProgressions] = useState({})
  const [loading, setLoading]           = useState(true)
  const [coursActif, setCoursActif]     = useState(null)
  const [ressources, setRessources]     = useState([])

  // ── Charger les inscriptions ──────────────
  useEffect(() => {
    chargerInscriptions()
  }, [])

  const chargerInscriptions = () => {
    setLoading(true)
    api.get(`/progression/mes-cours/${user.id}`)
      .then(res => {
        setInscriptions(res.data)
        // Charger la progression pour chaque cours
        res.data.forEach(insc => {
          chargerProgression(insc.cours.idCours)
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const chargerProgression = (idCours) => {
    api.get(`/progression/cours/${idCours}/utilisateur/${user.id}`)
      .then(res => {
        setProgressions(prev => ({
          ...prev,
          [idCours]: res.data.pourcentage
        }))
      })
      .catch(() => {})
  }

  // ── Voir les ressources d'un cours ────────
  const voirCours = (idCours) => {
    setCoursActif(idCours)
    api.get(`/ressources/cours/${idCours}`)
      .then(res => setRessources(res.data))
      .catch(() => setRessources([]))
  }

  // ── Marquer une ressource comme vue ──────
  const marquerVue = (idRessource, idCours) => {
    api.post(`/progression/mettre-a-jour?idUtilisateur=${user.id}&idRessource=${idRessource}&idCours=${idCours}&estComplete=true`)
      .then(() => chargerProgression(idCours))
      .catch(() => {})
  }

  // ── Couleur de progression ────────────────
  const couleurProgression = (pct) => {
    if (pct >= 100) return '#10B981'
    if (pct >= 50)  return '#F59E0B'
    return '#4F46E5'
  }

  // ── Icône type ressource ──────────────────
  const iconeType = (type) => {
    const icones = {
      video:    'bx-play-circle',
      pdf:      'bx-file-pdf',
      lien:     'bx-link-external',
      image:    'bx-image',
      document: 'bx-file'
    }
    return icones[type] || 'bx-file'
  }

  return (
    <div className="progression-page">

      {/* ── EN-TÊTE ── */}
      <div className="progression-header">
        <div className="progression-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-trending-up'></i>
              Ma Progression
            </h1>
            <p>Suivez votre avancement dans vos cours</p>
          </div>
        </div>
      </div>

      <div className="progression-container">

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        )}

        {!loading && inscriptions.length === 0 && (
          <div className="empty-state">
            <i className='bx bx-book-open'></i>
            <h3>Vous n'êtes inscrit à aucun cours</h3>
            <p>Retournez à l'accueil pour découvrir nos formations</p>
            <button className="btn-action" onClick={onRetour}>
              <i className='bx bx-home'></i>
              Découvrir les cours
            </button>
          </div>
        )}

        {!loading && inscriptions.length > 0 && (
          <div className="progression-layout">

            {/* ── LISTE DES COURS ── */}
            <div className="cours-liste">
              <h2>Mes cours ({inscriptions.length})</h2>

              {inscriptions.map(insc => {
                const pct = progressions[insc.cours.idCours] || 0
                return (
                  <div
                    key={insc.idInscription}
                    className={`cours-item ${coursActif === insc.cours.idCours ? 'actif' : ''}`}
                    onClick={() => voirCours(insc.cours.idCours)}
                  >
                    {/* Image placeholder */}
                    <div className="cours-item-image">
                      <i className='bx bx-book-open'></i>
                    </div>

                    <div className="cours-item-info">
                      <h3>{insc.cours.titre}</h3>

                      {/* Statut */}
                      <span className={`statut-badge statut-${insc.statut}`}>
                        {insc.statut === 'en_cours'  && '📚 En cours'}
                        {insc.statut === 'termine'   && '✅ Terminé'}
                        {insc.statut === 'abandonne' && '⏸️ Abandonné'}
                      </span>

                      {/* Barre de progression */}
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${pct}%`,
                            background: couleurProgression(pct)
                          }}
                        ></div>
                      </div>
                      <span className="progress-pct">{Math.round(pct)}%</span>
                    </div>

                    {/* Flèche */}
                    <i className='bx bx-chevron-right'></i>
                  </div>
                )
              })}
            </div>

            {/* ── DÉTAIL DU COURS ── */}
            <div className="cours-detail">
              {!coursActif ? (
                <div className="empty-detail">
                  <i className='bx bx-mouse-alt'></i>
                  <p>Cliquez sur un cours pour voir les ressources</p>
                </div>
              ) : (
                <>
                  <h2>Ressources du cours</h2>
                  <div className="progression-globale">
                    <span>Progression globale</span>
                    <div className="progress-bar-container large">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${progressions[coursActif] || 0}%`,
                          background: couleurProgression(progressions[coursActif] || 0)
                        }}
                      ></div>
                    </div>
                    <span className="pct-label">
                      {Math.round(progressions[coursActif] || 0)}%
                    </span>
                  </div>

                  {ressources.length === 0 ? (
                    <div className="empty-state">
                      <i className='bx bx-file'></i>
                      <p>Aucune ressource pour ce cours</p>
                    </div>
                  ) : (
                    <div className="ressources-progression">
                      {ressources.map(r => (
                        <div key={r.idRessource} className="ressource-prog-item">
                          <div className="ressource-prog-icon">
                            <i className={`bx ${iconeType(r.typeRessource)}`}></i>
                          </div>
                          <div className="ressource-prog-info">
                            <h4>{r.titre}</h4>
                            <span>{r.typeRessource}</span>
                          </div>
                          <button
                            className="btn-marquer"
                            onClick={() => marquerVue(r.idRessource, coursActif)}
                          >
                            <i className='bx bx-check'></i>
                            Marquer vue
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default Progression