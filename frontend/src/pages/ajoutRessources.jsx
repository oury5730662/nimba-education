// ============================================
// AjoutRessources.jsx — Page ajout ressources
// Permet d'ajouter des vidéos, PDF, liens
// à un cours existant
// ============================================

import { useState, useEffect } from 'react'
import api from '../services/api'
import './ajoutRessources.css'

// ── Types de ressource pouvant être uploadés directement ──
// ("lien" reste un champ URL : c'est par nature un lien externe)
const UPLOAD_PAR_TYPE = {
  video:    { accept: 'video/*',                                    endpoint: '/upload/video',    label: 'une vidéo (mp4, webm, mov — max 200 Mo)' },
  pdf:      { accept: '.pdf',                                       endpoint: '/upload/document', label: 'un fichier PDF (max 20 Mo)' },
  document: { accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt', endpoint: '/upload/document', label: 'un document (max 20 Mo)' },
  image:    { accept: 'image/*',                                    endpoint: '/upload/image',    label: 'une image (jpg, png, webp — max 5 Mo)' },
}

function AjoutRessources({ user, onRetour }) {

  // ── États ────────────────────────────────
  const [cours, setCours]           = useState([])
  const [sections, setSections]     = useState([])
  const [ressources, setRessources] = useState([])
  const [idCoursChoisi, setIdCoursChoisi] = useState('')
  const [onglet, setOnglet]         = useState('ressource')
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState({ type: '', texte: '' })
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [apercuImage, setApercuImage]     = useState('')

  // ── État formulaire ressource ────────────
  const [dataRessource, setDataRessource] = useState({
    titre:          '',
    description:    '',
    typeRessource:  'video',
    url:            '',
    nomFichier:     '',
    tailleFichier:  null,
    duree:          '',
    estGratuit:     false,
    ordre:          1,
    idSection:      ''
  })

  // ── État formulaire section ──────────────
  const [dataSection, setDataSection] = useState({
    titre:       '',
    description: '',
    ordre:       1
  })

  // ── Charger les cours du formateur ───────
  useEffect(() => {
    api.get(`/cours/formateur/${user.id}`)
      .then(res => setCours(res.data))
      .catch(err => console.log('Erreur cours:', err))
  }, [])

  // ── Charger sections quand cours choisi ──
  useEffect(() => {
    if (idCoursChoisi) {
      api.get(`/sections/cours/${idCoursChoisi}`)
        .then(res => setSections(res.data))
        .catch(err => console.log('Erreur sections:', err))

      api.get(`/ressources/cours/${idCoursChoisi}`)
        .then(res => setRessources(res.data))
        .catch(err => console.log('Erreur ressources:', err))
    }
  }, [idCoursChoisi])

  // ── Détecter changements ressource ───────
  const detectChangeRessource = (e) => {
    const { name, value, type, checked } = e.target
    setDataRessource(a => ({
      ...a,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ── Détecter changements section ─────────
  const detectChangeSection = (e) => {
    const { name, value } = e.target
    setDataSection(a => ({ ...a, [name]: value }))
  }

  // ── Upload direct du fichier (vidéo, pdf, document, image) ──
  const handleFichierChange = (e) => {
    const fichier = e.target.files[0]
    const config = UPLOAD_PAR_TYPE[dataRessource.typeRessource]
    if (!fichier || !config) return

    // Aperçu local immédiat (image uniquement)
    setApercuImage(dataRessource.typeRessource === 'image' ? URL.createObjectURL(fichier) : '')
    setMessage({ type: '', texte: '' })
    setUploadEnCours(true)

    const formData = new FormData()
    formData.append('file', fichier)

    api.post(config.endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setUploadEnCours(false)
        setDataRessource(a => ({
          ...a,
          url: res.data.url,
          nomFichier: fichier.name,
          tailleFichier: fichier.size
        }))
      })
      .catch(err => {
        setUploadEnCours(false)
        setApercuImage('')
        setDataRessource(a => ({ ...a, url: '', nomFichier: '', tailleFichier: null }))
        setMessage({
          type: 'error',
          texte: err.response?.data?.erreur || 'Erreur lors de l\'upload du fichier !'
        })
      })

    // Vidéo : détecter automatiquement la durée depuis le fichier local
    if (dataRessource.typeRessource === 'video') {
      const videoTemp = document.createElement('video')
      videoTemp.preload = 'metadata'
      videoTemp.onloadedmetadata = () => {
        URL.revokeObjectURL(videoTemp.src)
        setDataRessource(a => ({ ...a, duree: Math.round(videoTemp.duration) }))
      }
      videoTemp.src = URL.createObjectURL(fichier)
    }
  }

  // ── Soumettre ressource ───────────────────
  const handleSubmitRessource = (e) => {
    e.preventDefault()
    if (!idCoursChoisi) {
      setMessage({ type: 'error', texte: 'Choisissez un cours !' })
      return
    }
    if (!dataRessource.idSection) {
      setMessage({ type: 'error', texte: 'Choisissez une section !' })
      return
    }
    if (UPLOAD_PAR_TYPE[dataRessource.typeRessource] && !dataRessource.url) {
      setMessage({ type: 'error', texte: 'Choisissez un fichier !' })
      return
    }

    setLoading(true)
    api.post(`/ressources?idSection=${dataRessource.idSection}&idCours=${idCoursChoisi}`, {
      titre:         dataRessource.titre,
      description:   dataRessource.description,
      typeRessource: dataRessource.typeRessource,
      url:           dataRessource.url,
      nomFichier:    dataRessource.nomFichier,
      tailleFichier: dataRessource.tailleFichier,
      duree:         dataRessource.duree ? parseInt(dataRessource.duree) : null,
      estGratuit:    dataRessource.estGratuit,
      ordre:         parseInt(dataRessource.ordre) || 1
    })
      .then(() => {
        setLoading(false)
        setMessage({ type: 'success', texte: '✅ Ressource ajoutée avec succès !' })
        // Réinitialiser le formulaire
        setDataRessource({
          titre: '', description: '', typeRessource: 'video',
          url: '', nomFichier: '', tailleFichier: null, duree: '',
          estGratuit: false, ordre: 1, idSection: ''
        })
        setApercuImage('')
        // Recharger les ressources
        api.get(`/ressources/cours/${idCoursChoisi}`)
          .then(res => setRessources(res.data))
      })
      .catch(err => {
        setLoading(false)
        setMessage({
          type: 'error',
          texte: err.response?.data?.erreur || 'Erreur lors de l\'ajout !'
        })
      })
  }

  // ── Soumettre section ─────────────────────
  const handleSubmitSection = (e) => {
    e.preventDefault()
    if (!idCoursChoisi) {
      setMessage({ type: 'error', texte: 'Choisissez un cours !' })
      return
    }

    setLoading(true)
    api.post(`/sections?idCours=${idCoursChoisi}`, dataSection)
      .then(() => {
        setLoading(false)
        setMessage({ type: 'success', texte: '✅ Section créée avec succès !' })
        setDataSection({ titre: '', description: '', ordre: 1 })
        // Recharger les sections
        api.get(`/sections/cours/${idCoursChoisi}`)
          .then(res => setSections(res.data))
      })
      .catch(err => {
        setLoading(false)
        setMessage({
          type: 'error',
          texte: err.response?.data?.erreur || 'Erreur lors de la création !'
        })
      })
  }

  // ── Supprimer une ressource ───────────────
  const supprimerRessource = (id, titre) => {
    if (!window.confirm(`Supprimer "${titre}" ?`)) return
    api.delete(`/ressources/${id}`)
      .then(() => {
        setRessources(ressources.filter(r => r.idRessource !== id))
        setMessage({ type: 'success', texte: '✅ Ressource supprimée !' })
      })
      .catch(() => setMessage({ type: 'error', texte: 'Erreur suppression !' }))
  }

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

  return (
    <div className="ressources-page">

      {/* ── EN-TÊTE ── */}
      <div className="ressources-header">
        <div className="ressources-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-video-plus'></i>
              Ajouter des ressources
            </h1>
            <p>Enrichissez vos cours avec des vidéos, PDF et liens</p>
          </div>
        </div>
      </div>

      <div className="ressources-container">

        {/* ── SÉLECTION DU COURS ── */}
        <div className="cours-selector">
          <label>
            <i className='bx bx-book'></i>
            Sélectionnez votre cours
          </label>
          <select
            value={idCoursChoisi}
            onChange={(e) => setIdCoursChoisi(e.target.value)}
          >
            <option value="">-- Choisir un cours --</option>
            {cours.map(c => (
              <option key={c.idCours} value={c.idCours}>
                {c.titre}
              </option>
            ))}
          </select>

          {/* Infos cours sélectionné */}
          {idCoursChoisi && (
            <div className="cours-infos-badges">
              <span className="info-badge">
                <i className='bx bx-layer'></i>
                {sections.length} section(s)
              </span>
              <span className="info-badge">
                <i className='bx bx-file'></i>
                {ressources.length} ressource(s)
              </span>
            </div>
          )}
        </div>

        {/* ── MESSAGE ── */}
        {message.texte && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
            <i className={`bx ${message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle'}`}></i>
            {message.texte}
            <button onClick={() => setMessage({ type: '', texte: '' })}>
              <i className='bx bx-x'></i>
            </button>
          </div>
        )}

        {/* ── ONGLETS ── */}
        <div className="onglets">
          <button
            className={`onglet ${onglet === 'ressource' ? 'active' : ''}`}
            onClick={() => setOnglet('ressource')}
          >
            <i className='bx bx-plus-circle'></i>
            Ajouter une ressource
          </button>
          <button
            className={`onglet ${onglet === 'section' ? 'active' : ''}`}
            onClick={() => setOnglet('section')}
          >
            <i className='bx bx-folder-plus'></i>
            Créer une section
          </button>
          <button
            className={`onglet ${onglet === 'liste' ? 'active' : ''}`}
            onClick={() => setOnglet('liste')}
          >
            <i className='bx bx-list-ul'></i>
            Voir les ressources
            {ressources.length > 0 && (
              <span className="badge-count">{ressources.length}</span>
            )}
          </button>
        </div>

        {/* ── ONGLET RESSOURCE ── */}
        {onglet === 'ressource' && (
          <div className="onglet-content">
            <form onSubmit={handleSubmitRessource}>

              {/* Titre */}
              <div className="form-group">
                <label>Titre de la ressource *</label>
                <div className="input-wrapper">
                  <i className='bx bx-text'></i>
                  <input
                    type="text"
                    name="titre"
                    value={dataRessource.titre}
                    onChange={detectChangeRessource}
                    placeholder="Ex: Introduction aux composants"
                    required
                  />
                </div>
              </div>

              {/* Type et Section */}
              <div className="form-row">
                <div className="form-group">
                  <label>Type de ressource *</label>
                  <div className="type-selector">
                    {[
                      { value: 'video',    label: 'Vidéo',    icon: 'bx-play-circle' },
                      { value: 'pdf',      label: 'PDF',      icon: 'bx-file-pdf' },
                      { value: 'lien',     label: 'Lien',     icon: 'bx-link' },
                      { value: 'document', label: 'Document', icon: 'bx-file' },
                      { value: 'image',    label: 'Image',    icon: 'bx-image' },
                    ].map(t => (
                      <div
                        key={t.value}
                        className={`type-option ${dataRessource.typeRessource === t.value ? 'active' : ''}`}
                        onClick={() => {
                          setApercuImage('')
                          setDataRessource(a => ({ ...a, typeRessource: t.value, url: '', nomFichier: '', tailleFichier: null }))
                        }}
                      >
                        <i className={`bx ${t.icon}`}></i>
                        <span>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Section *</label>
                  <div className="input-wrapper">
                    <i className='bx bx-layer'></i>
                    <select
                      name="idSection"
                      value={dataRessource.idSection}
                      onChange={detectChangeRessource}
                    >
                      <option value="">-- Choisir --</option>
                      {sections.map(s => (
                        <option key={s.idSection} value={s.idSection}>
                          {s.ordre}. {s.titre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {sections.length === 0 && idCoursChoisi && (
                    <small className="warning-text">
                      ⚠️ Créez d'abord une section
                    </small>
                  )}
                </div>
              </div>

              {/* Upload direct du fichier, ou URL pour un lien externe */}
              {UPLOAD_PAR_TYPE[dataRessource.typeRessource] ? (
                <div className="form-group">
                  <label>Fichier *</label>
                  <label className="upload-zone">
                    <input
                      type="file"
                      accept={UPLOAD_PAR_TYPE[dataRessource.typeRessource].accept}
                      onChange={handleFichierChange}
                      disabled={uploadEnCours}
                      hidden
                    />
                    {uploadEnCours ? (
                      <>
                        <div className="spinner"></div>
                        <span>Upload en cours...</span>
                      </>
                    ) : (
                      <>
                        <i className='bx bx-cloud-upload'></i>
                        <span>
                          {dataRessource.nomFichier
                            ? dataRessource.nomFichier
                            : `Choisir ${UPLOAD_PAR_TYPE[dataRessource.typeRessource].label}`}
                        </span>
                      </>
                    )}
                  </label>
                  {/* Aperçu image */}
                  {apercuImage && dataRessource.typeRessource === 'image' && (
                    <div className="image-preview">
                      <img src={apercuImage} alt="Aperçu" />
                    </div>
                  )}
                  {/* Fichier choisi (vidéo, pdf, document) */}
                  {dataRessource.nomFichier && dataRessource.typeRessource !== 'image' && (
                    <div className="fichier-choisi">
                      <i className={`bx ${iconeType(dataRessource.typeRessource)}`}></i>
                      <span>{dataRessource.nomFichier}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label>URL de la ressource *</label>
                  <div className="input-wrapper">
                    <i className='bx bx-link'></i>
                    <input
                      type="text"
                      name="url"
                      value={dataRessource.url}
                      onChange={detectChangeRessource}
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Durée et Ordre */}
              <div className="form-row">
                <div className="form-group">
                  <label>Durée (secondes)</label>
                  <div className="input-wrapper">
                    <i className='bx bx-time'></i>
                    <input
                      type="number"
                      name="duree"
                      value={dataRessource.duree}
                      onChange={detectChangeRessource}
                      placeholder="Ex: 600 = 10 min"
                      min={0}
                      disabled={dataRessource.typeRessource !== 'video'}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ordre</label>
                  <div className="input-wrapper">
                    <i className='bx bx-sort'></i>
                    <input
                      type="number"
                      name="ordre"
                      value={dataRessource.ordre}
                      onChange={detectChangeRessource}
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Aperçu gratuit */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="estGratuit"
                    checked={dataRessource.estGratuit}
                    onChange={detectChangeRessource}
                  />
                  <span>
                    <i className='bx bx-gift'></i>
                    Aperçu gratuit (accessible sans inscription)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-ajouter"
                disabled={loading || !idCoursChoisi}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <i className='bx bx-plus'></i>
                    Ajouter la ressource
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* ── ONGLET SECTION ── */}
        {onglet === 'section' && (
          <div className="onglet-content">
            <p className="section-info">
              <i className='bx bx-info-circle'></i>
              Une section est un chapitre de votre cours.
              Créez des sections avant d'ajouter des ressources.
            </p>

            <form onSubmit={handleSubmitSection}>

              <div className="form-group">
                <label>Titre de la section *</label>
                <div className="input-wrapper">
                  <i className='bx bx-text'></i>
                  <input
                    type="text"
                    name="titre"
                    value={dataSection.titre}
                    onChange={detectChangeSection}
                    placeholder="Ex: Introduction et Installation"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={dataSection.description}
                  onChange={detectChangeSection}
                  placeholder="Décrivez le contenu de cette section..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Ordre (numéro du chapitre)</label>
                <div className="input-wrapper">
                  <i className='bx bx-sort'></i>
                  <input
                    type="number"
                    name="ordre"
                    value={dataSection.ordre}
                    onChange={detectChangeSection}
                    min={1}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-ajouter"
                disabled={loading || !idCoursChoisi}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <i className='bx bx-folder-plus'></i>
                    Créer la section
                  </>
                )}
              </button>

            </form>

            {/* Sections existantes */}
            {sections.length > 0 && (
              <div className="sections-liste">
                <h3>Sections existantes</h3>
                {sections.map(s => (
                  <div key={s.idSection} className="section-item">
                    <span className="section-numero">{s.ordre}</span>
                    <span className="section-titre">{s.titre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET LISTE ── */}
        {onglet === 'liste' && (
          <div className="onglet-content">
            {!idCoursChoisi ? (
              <div className="empty-state">
                <i className='bx bx-book'></i>
                <p>Sélectionnez un cours pour voir ses ressources</p>
              </div>
            ) : ressources.length === 0 ? (
              <div className="empty-state">
                <i className='bx bx-file'></i>
                <p>Aucune ressource pour ce cours</p>
                <button
                  className="btn-ajouter"
                  onClick={() => setOnglet('ressource')}
                >
                  <i className='bx bx-plus'></i>
                  Ajouter la première ressource
                </button>
              </div>
            ) : (
              <div className="ressources-liste">
                {ressources.map(r => (
                  <div key={r.idRessource} className="ressource-item">
                    <div className="ressource-icon">
                      <i className={`bx ${iconeType(r.typeRessource)}`}></i>
                    </div>
                    <div className="ressource-info">
                      <h4>{r.titre}</h4>
                      <span className="ressource-type">{r.typeRessource}</span>
                      {r.duree && (
                        <span className="ressource-duree">
                          <i className='bx bx-time'></i>
                          {Math.floor(r.duree / 60)} min
                        </span>
                      )}
                    </div>
                    {r.estGratuit && (
                      <span className="badge-gratuit">Gratuit</span>
                    )}
                    <button
                      className="btn-supprimer"
                      onClick={() => supprimerRessource(r.idRessource, r.titre)}
                    >
                      <i className='bx bx-trash'></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default AjoutRessources