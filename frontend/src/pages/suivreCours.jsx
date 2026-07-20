// ============================================
// SuivreCours.jsx — Page de suivi d'un cours
// L'apprenant consulte les sections et
// ressources (vidéos, PDF, liens...) d'un cours
//
// Progression automatique, par type de ressource :
// - VIDEO : suivie via onTimeUpdate, terminée à 90% du visionnage
// - IMAGE / PDF (contenu intégré à la page) : suivie via la
//   présence réelle de l'onglet au premier plan (Page Visibility +
//   focus fenêtre). Le minuteur est en PAUSE si l'apprenant change
//   d'onglet ou d'application.
// - DOCUMENT (office, non intégrable) / LIEN (site externe) : le
//   suivi ne démarre qu'après un clic explicite sur "Ouvrir", puis
//   compte le temps passé HORS de cet onglet (l'apprenant est
//   présumé en train de consulter le fichier/lien externe).
// Le temps de lecture requis est calculé depuis la taille réelle du
// fichier (tailleFichier) pour éviter qu'un document volumineux ne
// soit validé aussi vite qu'une page vide.
// ============================================

import { useState, useEffect, useRef } from 'react'
import api, { resolveFileUrl } from '../services/api'
import './suivreCours.css'

const SEUIL_VIDEO_TERMINEE       = 0.9    // 90% de la vidéo regardée = terminée
const INTERVALLE_HEARTBEAT_VIDEO = 10000  // Envoi de la position vidéo toutes les 10s

// ── Ressources dont le contenu est affiché DIRECTEMENT dans la page ──
// (par opposition aux ressources qui s'ouvrent dans un onglet externe)
const CONTENU_INTEGRE = { image: true, pdf: true, document: false, lien: false }

// ── Temps de lecture engagée requis avant auto-complétion ──
const TEMPS_MIN_LECTURE      = 15000   // plancher : 15s
const TEMPS_MAX_LECTURE      = 120000  // plafond : 2 min
const OCTETS_PAR_SECONDE     = 20000   // ~20 Ko/s de lecture estimée
const TEMPS_LECTURE_IMAGE    = 6000    // une image se consulte vite
const TEMPS_LECTURE_DEFAUT   = 25000   // taille inconnue (lien externe, vieille ressource)

function calculerTempsRequis(ressource) {
  if (ressource.typeRessource === 'image') return TEMPS_LECTURE_IMAGE
  if (!ressource.tailleFichier) return TEMPS_LECTURE_DEFAUT
  const estime = (ressource.tailleFichier / OCTETS_PAR_SECONDE) * 1000
  return Math.min(TEMPS_MAX_LECTURE, Math.max(TEMPS_MIN_LECTURE, estime))
}

function SuivreCours({ user, idCours, onRetour }) {

  // ── États ────────────────────────────────
  const [cours, setCours]           = useState(null)
  const [sections, setSections]     = useState([])
  const [ressourcesParSection, setRessourcesParSection] = useState({})
  const [ressourceActive, setRessourceActive] = useState(null)
  const [completees, setCompletees] = useState([])
  const [pourcentage, setPourcentage] = useState(0)
  const [loading, setLoading]       = useState(true)
  const [erreur, setErreur]         = useState('')
  const [toast, setToast]           = useState('')

  // ── Certification ─────────────────────────
  const [eligibilite, setEligibilite]         = useState(null)
  const [demandeEnCours, setDemandeEnCours]   = useState(false)

  // ── Suivi de lecture (PDF/image/document/lien) ──
  const [lectureEnCours, setLectureEnCours]     = useState(false)
  const [progressionLecture, setProgressionLecture] = useState(0) // 0-100
  const [etatLecture, setEtatLecture]           = useState('active') // 'attente' | 'active' | 'pause'

  const dernierEnvoiVideoRef = useRef(0)     // horodatage du dernier heartbeat vidéo
  const envoiEnCoursRef      = useRef(false) // verrou anti-doublon pour les appels réseau
  const toastTimeoutRef      = useRef(null)
  const ouvertRef            = useRef(false) // a cliqué "Ouvrir" (ressources externes)
  const tempsAccumuleRef     = useRef(0)     // ms de lecture engagée accumulés

  // ── Charger le cours, ses sections et ressources ──
  useEffect(() => {
    setLoading(true)
    setErreur('')

    Promise.all([
      api.get(`/cours/${idCours}`),
      api.get(`/sections/cours/${idCours}`),
      api.get(`/progression/cours/${idCours}/utilisateur/${user.id}`)
    ])
      .then(([resCours, resSections, resProgression]) => {
        setCours(resCours.data)
        setPourcentage(resProgression.data.pourcentage || 0)
        setCompletees(resProgression.data.ressourcesCompletees || [])

        const sectionsTriees = [...resSections.data]
          .sort((a, b) => a.ordre - b.ordre)
        setSections(sectionsTriees)

        // Charger les ressources de chaque section
        return Promise.all(
          sectionsTriees.map(s =>
            api.get(`/ressources/section/${s.idSection}`)
              .then(res => ({ idSection: s.idSection, ressources: res.data }))
          )
        )
      })
      .then(resultats => {
        const map = {}
        resultats.forEach(r => {
          map[r.idSection] = [...r.ressources].sort((a, b) => a.ordre - b.ordre)
        })
        setRessourcesParSection(map)

        // Sélectionner la première ressource du cours
        const premiere = resultats
          .flatMap(r => map[r.idSection])
          .find(r => r)
        if (premiere) setRessourceActive(premiere)

        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
        setErreur(
          err.response?.data?.erreur || 'Impossible de charger le cours !'
        )
      })
  }, [idCours, user.id])

  // ── Certification : éligibilité + certificat déjà obtenu ──
  const chargerEligibilite = () => {
    api.get(`/certificats/eligibilite/${idCours}/${user.id}`)
      .then(res => setEligibilite(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    if (!cours?.estCertifiant) return
    chargerEligibilite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cours?.estCertifiant, idCours, user.id])

  // ── Liste plate des ressources (ordre du cours) ──
  const listeRessources = sections.flatMap(
    s => ressourcesParSection[s.idSection] || []
  )
  const indexActif = ressourceActive
    ? listeRessources.findIndex(r => r.idRessource === ressourceActive.idRessource)
    : -1

  // ── Navigation précédente / suivante ─────
  const allerRessource = (index) => {
    if (index >= 0 && index < listeRessources.length) {
      setRessourceActive(listeRessources[index])
    }
  }

  // ── Toast de notification (bas droite) ───
  const afficherToast = (message) => {
    setToast(message)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(''), 3000)
  }

  // ── Envoyer une mise à jour de progression ──
  // Un seul appel réseau à la fois : les ticks suivants sont ignorés
  // tant que le précédent n'est pas terminé (évite les doublons)
  const envoyerProgression = (idRessource, position, estComplete) => {
    if (envoiEnCoursRef.current) return
    envoiEnCoursRef.current = true

    api.post(
      `/progression/mettre-a-jour?idUtilisateur=${user.id}` +
      `&idRessource=${idRessource}&idCours=${idCours}` +
      `&position=${position}&estComplete=${estComplete}`
    )
      .then(() => {
        if (estComplete) {
          setCompletees(c => c.includes(idRessource) ? c : [...c, idRessource])
          afficherToast('✓ Ressource terminée !')
        }
        return api.get(`/progression/cours/${idCours}/utilisateur/${user.id}`)
      })
      .then(res => {
        setPourcentage(res.data.pourcentage || 0)
        if (cours?.estCertifiant) chargerEligibilite()
      })
      .catch(() => {
        // Mise à jour silencieuse : un raté réseau ponctuel ne doit pas
        // interrompre la lecture ni afficher une alerte intrusive
      })
      .finally(() => { envoiEnCoursRef.current = false })
  }

  // ── Demander le certificat (actif si les 2 conditions auto sont remplies) ──
  // Le certificat n'est délivré qu'après validation manuelle par le formateur
  const demanderCertificat = () => {
    if (demandeEnCours || !eligibilite?.peutObtenirCertificat) return
    setDemandeEnCours(true)

    api.post(`/certificats/generer?idUtilisateur=${user.id}&idCours=${idCours}`)
      .then(() => {
        setDemandeEnCours(false)
        afficherToast('📨 Demande envoyée au formateur !')
        chargerEligibilite()
      })
      .catch(err => {
        setDemandeEnCours(false)
        setErreur(err.response?.data?.erreur || 'Erreur lors de la demande de certificat !')
      })
  }

  // ── Réinitialiser le heartbeat vidéo à chaque changement de ressource ──
  useEffect(() => {
    dernierEnvoiVideoRef.current = Date.now()
  }, [ressourceActive?.idRessource])

  // ── VIDEO : position toutes les 10s + terminée à 90% ──
  const gererTimeUpdateVideo = (e) => {
    if (!ressourceActive || completees.includes(ressourceActive.idRessource)) return

    const video = e.target
    if (!video.duration || Number.isNaN(video.duration)) return

    const position = Math.floor(video.currentTime)
    const ratio = video.currentTime / video.duration

    if (ratio >= SEUIL_VIDEO_TERMINEE) {
      envoyerProgression(ressourceActive.idRessource, position, true)
      return
    }

    const maintenant = Date.now()
    if (maintenant - dernierEnvoiVideoRef.current >= INTERVALLE_HEARTBEAT_VIDEO) {
      dernierEnvoiVideoRef.current = maintenant
      envoyerProgression(ressourceActive.idRessource, position, false)
    }
  }

  // Filet de sécurité : la vidéo arrive à sa fin sans avoir déclenché le seuil de 90%
  const gererFinVideo = (e) => {
    if (!ressourceActive || completees.includes(ressourceActive.idRessource)) return
    envoyerProgression(ressourceActive.idRessource, Math.floor(e.target.duration || 0), true)
  }

  // Marque qu'un lien/document externe a réellement été ouvert par l'apprenant
  const gererOuvertureExterne = () => { ouvertRef.current = true }

  // ── IMAGE / PDF / DOCUMENT / LIEN : suivi de lecture engagée ──
  // Le minuteur ne progresse QUE si l'apprenant est réellement en train
  // de consulter la ressource :
  //  - contenu intégré (image, pdf affiché dans la page) → onglet visible ET focus
  //  - contenu externe (document bureautique, lien) → après un clic sur
  //    "Ouvrir", tant que l'apprenant est SORTI de cet onglet (présumé en
  //    train de lire le fichier/site externe dans l'autre onglet)
  useEffect(() => {
    if (!ressourceActive) return
    if (ressourceActive.typeRessource === 'video') return
    if (completees.includes(ressourceActive.idRessource)) return

    const idRessource = ressourceActive.idRessource
    const integre = !!CONTENU_INTEGRE[ressourceActive.typeRessource]
    const tempsRequis = calculerTempsRequis(ressourceActive)

    ouvertRef.current = integre // le contenu intégré est déjà "ouvert" dès l'affichage
    tempsAccumuleRef.current = 0
    setLectureEnCours(true)
    setProgressionLecture(0)
    setEtatLecture(integre ? 'active' : 'attente')

    // Marque la ressource "en cours de lecture" dès l'ouverture
    envoyerProgression(idRessource, 0, false)

    const intervalle = setInterval(() => {
      const onCetOnglet = document.visibilityState === 'visible' && document.hasFocus()
      const engage = integre ? (ouvertRef.current && onCetOnglet) : (ouvertRef.current && !onCetOnglet)

      if (!ouvertRef.current) {
        setEtatLecture('attente')
        return
      }
      setEtatLecture(engage ? 'active' : 'pause')
      if (!engage) return

      tempsAccumuleRef.current += 1000
      setProgressionLecture(Math.min(100, Math.round((tempsAccumuleRef.current / tempsRequis) * 100)))

      if (tempsAccumuleRef.current >= tempsRequis) {
        clearInterval(intervalle)
        envoyerProgression(idRessource, Math.round(tempsAccumuleRef.current / 1000), true)
      }
    }, 1000)

    return () => {
      clearInterval(intervalle)
      setLectureEnCours(false)
    }
    // Ne se redéclenche qu'au changement de ressource, pas à chaque
    // mise à jour de `completees` (sinon le minuteur repartirait sans cesse)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ressourceActive?.idRessource])

  // ── Icône selon type ──────────────────────
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

  // ── Affichage de la ressource active ─────
  const afficherRessource = (r) => {
    const url = resolveFileUrl(r.url)

    switch (r.typeRessource) {

      case 'video':
        return (
          <video
            key={r.idRessource}
            className="lecteur-video"
            controls
            src={url}
            onTimeUpdate={gererTimeUpdateVideo}
            onEnded={gererFinVideo}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )

      case 'pdf':
        // Affiché directement dans la page : le suivi de lecture peut
        // observer la présence réelle de l'apprenant sur cette page
        return (
          <div className="ressource-pdf">
            <iframe
              key={r.idRessource}
              src={url}
              className="visionneuse-pdf"
              title={r.titre}
            ></iframe>
            <a href={url} target="_blank" rel="noopener noreferrer" className="lien-secondaire">
              <i className='bx bx-link-external'></i>
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        )

      case 'lien':
        return (
          <div className="ressource-fichier">
            <i className='bx bx-link-external'></i>
            <p>Ressource externe</p>
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="btn-ouvrir" onClick={gererOuvertureExterne}
            >
              <i className='bx bx-link'></i>
              Accéder au lien
            </a>
          </div>
        )

      case 'image':
        return (
          <div className="ressource-image">
            <img src={url} alt={r.titre} />
          </div>
        )

      case 'document':
      default:
        return (
          <div className="ressource-fichier">
            <i className='bx bx-file'></i>
            <p>{r.nomFichier || r.titre}</p>
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="btn-ouvrir" onClick={gererOuvertureExterne}
            >
              <i className='bx bx-download'></i>
              Ouvrir le document
            </a>
          </div>
        )
    }
  }

  // ── Chargement ────────────────────────────
  if (loading) {
    return (
      <div className="suivre-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Chargement du cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="suivre-page">

      {/* ── EN-TÊTE ── */}
      <div className="suivre-header">
        <div className="suivre-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div className="suivre-titre">
            <h1>{cours?.titre}</h1>
            <p>{cours?.description}</p>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="progression-globale">
          <div className="progression-infos">
            <span>
              <i className='bx bx-trending-up'></i>
              Progression du cours
            </span>
            <strong>{Math.round(pourcentage)}%</strong>
          </div>
          <div className="progression-barre">
            <div
              className="progression-remplie"
              style={{ width: `${pourcentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ── ENCART CERTIFICATION ── */}
      {cours?.estCertifiant && eligibilite && (
        <div className="encart-certification">
          <div className="certification-header">
            <i className='bx bx-certification'></i>
            <h3>Certification</h3>
            {eligibilite.statutCertificat === 'valide' && (
              <span className="badge-terminee">
                <i className='bx bxs-check-circle'></i>
                Certificat validé
              </span>
            )}
            {eligibilite.statutCertificat === 'en_attente' && (
              <span className="badge-en-attente-validation">
                <i className='bx bx-time-five'></i>
                En attente de validation par le formateur
              </span>
            )}
          </div>

          {eligibilite.statutCertificat === 'refuse' && (
            <div className="alert-refus-certificat">
              <i className='bx bx-x-circle'></i>
              <span>
                Votre demande a été refusée par le formateur
                {eligibilite.commentaireRefus ? ` : ${eligibilite.commentaireRefus}` : ' !'}
              </span>
            </div>
          )}

          {eligibilite.statutCertificat !== 'valide' && eligibilite.statutCertificat !== 'en_attente' && (
            <>
              <div className="certification-conditions">
                <div className={'condition-item' + (eligibilite.progressionOk ? ' ok' : '')}>
                  <i className={'bx ' + (eligibilite.progressionOk ? 'bxs-check-circle' : 'bx-circle')}></i>
                  <span>Progression : {Math.round(eligibilite.pourcentage)}% / 80% requis</span>
                </div>
                <div className={'condition-item' + (eligibilite.quizOk ? ' ok' : '')}>
                  <i className={'bx ' + (eligibilite.quizOk ? 'bxs-check-circle' : 'bx-circle')}></i>
                  <span>Note quiz final : {Math.round(eligibilite.meilleureNote)}/100 (75 requis)</span>
                </div>
              </div>

              <button
                className="btn-obtenir-certificat"
                disabled={!eligibilite.peutObtenirCertificat || demandeEnCours}
                onClick={demanderCertificat}
              >
                {demandeEnCours ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <i className='bx bx-certification'></i>
                    {eligibilite.statutCertificat === 'refuse' ? 'Redemander mon certificat' : 'Demander mon certificat'}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── MESSAGE D'ERREUR ── */}
      {erreur && (
        <div className="alert alert-error">
          <i className='bx bx-error-circle'></i>
          {erreur}
          <button onClick={() => setErreur('')}>
            <i className='bx bx-x'></i>
          </button>
        </div>
      )}

      {/* ── CONTENU : SIDEBAR + PANNEAU ── */}
      <div className="suivre-container">

        {/* ── SIDEBAR DES SECTIONS ── */}
        <aside className="suivre-sidebar">
          <h3>
            <i className='bx bx-list-ul'></i>
            Contenu du cours
          </h3>

          {sections.length === 0 && (
            <p className="sidebar-vide">Aucune section pour ce cours.</p>
          )}

          {sections.map(s => (
            <div key={s.idSection} className="sidebar-section">
              <div className="sidebar-section-titre">
                <span className="section-numero">{s.ordre}</span>
                <span>{s.titre}</span>
              </div>

              {(ressourcesParSection[s.idSection] || []).map(r => (
                <button
                  key={r.idRessource}
                  className={
                    'sidebar-ressource' +
                    (ressourceActive?.idRessource === r.idRessource ? ' active' : '')
                  }
                  onClick={() => setRessourceActive(r)}
                >
                  <i className={`bx ${iconeType(r.typeRessource)}`}></i>
                  <span className="sidebar-ressource-titre">{r.titre}</span>
                  {completees.includes(r.idRessource) && (
                    <i className='bx bxs-check-circle coche-terminee'></i>
                  )}
                </button>
              ))}

              {(ressourcesParSection[s.idSection] || []).length === 0 && (
                <p className="sidebar-vide">Aucune ressource</p>
              )}
            </div>
          ))}
        </aside>

        {/* ── PANNEAU PRINCIPAL ── */}
        <main className="suivre-panneau">

          {!ressourceActive ? (
            <div className="empty-state">
              <i className='bx bx-book-open'></i>
              <p>Ce cours ne contient pas encore de ressources.</p>
            </div>
          ) : (
            <>
              {/* Titre de la ressource */}
              <div className="panneau-header">
                <div>
                  <span className="panneau-type">
                    <i className={`bx ${iconeType(ressourceActive.typeRessource)}`}></i>
                    {ressourceActive.typeRessource}
                  </span>
                  <h2>{ressourceActive.titre}</h2>
                  {ressourceActive.description && (
                    <p>{ressourceActive.description}</p>
                  )}
                </div>

                {/* Statut de progression — entièrement automatique */}
                {completees.includes(ressourceActive.idRessource) ? (
                  <span className="badge-terminee">
                    <i className='bx bxs-check-circle'></i>
                    Terminée
                  </span>
                ) : ressourceActive.typeRessource !== 'video' && lectureEnCours ? (
                  <div className={`suivi-lecture suivi-${etatLecture}`}>
                    <div className="suivi-lecture-barre">
                      <div
                        className="suivi-lecture-remplie"
                        style={{ width: `${progressionLecture}%` }}
                      ></div>
                    </div>
                    <span className="suivi-lecture-texte">
                      {etatLecture === 'attente' && (
                        <>
                          <i className='bx bx-hand-up'></i>
                          Ouvrez la ressource pour démarrer le suivi
                        </>
                      )}
                      {etatLecture === 'active' && (
                        <>
                          <div className="spinner-mini"></div>
                          Lecture en cours... {progressionLecture}%
                        </>
                      )}
                      {etatLecture === 'pause' && (
                        <>
                          <i className='bx bx-pause-circle'></i>
                          En pause — revenez sur cette page
                        </>
                      )}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Affichage selon le type */}
              <div className="panneau-contenu">
                {afficherRessource(ressourceActive)}
              </div>

              {/* Navigation précédente / suivante */}
              <div className="panneau-navigation">
                <button
                  className="btn-nav"
                  onClick={() => allerRessource(indexActif - 1)}
                  disabled={indexActif <= 0}
                >
                  <i className='bx bx-left-arrow-alt'></i>
                  Ressource précédente
                </button>
                <span className="nav-position">
                  {indexActif + 1} / {listeRessources.length}
                </span>
                <button
                  className="btn-nav"
                  onClick={() => allerRessource(indexActif + 1)}
                  disabled={indexActif >= listeRessources.length - 1}
                >
                  Ressource suivante
                  <i className='bx bx-right-arrow-alt'></i>
                </button>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── TOAST DE NOTIFICATION ── */}
      {toast && (
        <div className="toast-notification">
          <i className='bx bxs-check-circle'></i>
          {toast}
        </div>
      )}
    </div>
  )
}

export default SuivreCours
