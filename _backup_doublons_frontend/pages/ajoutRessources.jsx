import { useState, useEffect } from 'react'
import api from '../services/api'
import './ajoutRessources.css'

function AjoutRessources({ user, onRetour }) {

  const [cours, setCours]           = useState([])
  const [sections, setSections]     = useState([])
  const [ressources, setRessources] = useState([])
  const [idCoursChoisi, setIdCoursChoisi] = useState('')
  const [onglet, setOnglet]         = useState('ressource')
  const [loading, setLoading]       = useState(false)
  const [loadingCours, setLoadingCours] = useState(true)
  const [message, setMessage]       = useState({ type: '', texte: '' })

  const [dataRessource, setDataRessource] = useState({
    titre: '', description: '', typeRessource: 'video', url: '',
    nomFichier: '', duree: '', estGratuit: false, ordre: 1, idSection: ''
  })

  const [dataSection, setDataSection] = useState({ titre: '', description: '', ordre: 1 })

  // ── Charger les cours du formateur ───────────────────────
  const chargerCours = () => {
    if (!user || !user.id) { setLoadingCours(false); return }
    setLoadingCours(true)
    api.get(`/cours/formateur/${user.id}`)
      .then(res => {
        const liste = Array.isArray(res.data) ? res.data : []
        setCours(liste)
        setLoadingCours(false)
        if (liste.length === 0) {
          setMessage({ type: 'error', texte: 'Vous n avez encore aucun cours. Creez-en un d abord dans "Creer un cours" !' })
        }
      })
      .catch(() => {
        setLoadingCours(false)
        setMessage({ type: 'error', texte: 'Impossible de charger vos cours. Verifiez que le serveur backend est bien demarre.' })
      })
  }

  useEffect(() => { chargerCours() }, [user])

  useEffect(() => {
    if (idCoursChoisi) {
      api.get(`/sections/cours/${idCoursChoisi}`)
        .then(res => setSections(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSections([]))
      api.get(`/ressources/cours/${idCoursChoisi}`)
        .then(res => setRessources(Array.isArray(res.data) ? res.data : []))
        .catch(() => setRessources([]))
    } else {
      setSections([]); setRessources([])
    }
  }, [idCoursChoisi])

  const detectChangeRessource = (e) => {
    const { name, value, type, checked } = e.target
    setDataRessource(a => ({ ...a, [name]: type === 'checkbox' ? checked : value }))
  }

  const detectChangeSection = (e) => {
    const { name, value } = e.target
    setDataSection(a => ({ ...a, [name]: value }))
  }

  const handleSubmitRessource = (e) => {
    e.preventDefault()
    if (!idCoursChoisi) { setMessage({ type: 'error', texte: 'Choisissez un cours !' }); return }
    if (!dataRessource.idSection) { setMessage({ type: 'error', texte: 'Choisissez une section !' }); return }
    if (!dataRessource.titre.trim()) { setMessage({ type: 'error', texte: 'Le titre est obligatoire !' }); return }
    if (!dataRessource.url.trim()) { setMessage({ type: 'error', texte: 'L URL est obligatoire !' }); return }

    setLoading(true)
    api.post(`/ressources?idSection=${dataRessource.idSection}&idCours=${idCoursChoisi}`, {
      titre: dataRessource.titre,
      description: dataRessource.description,
      typeRessource: dataRessource.typeRessource,
      url: dataRessource.url,
      nomFichier: dataRessource.nomFichier,
      duree: dataRessource.duree ? parseInt(dataRessource.duree) : null,
      estGratuit: dataRessource.estGratuit,
      ordre: parseInt(dataRessource.ordre) || 1
    })
      .then(() => {
        setLoading(false)
        setMessage({ type: 'success', texte: 'Ressource ajoutee avec succes !' })
        setDataRessource({ titre: '', description: '', typeRessource: 'video', url: '', nomFichier: '', duree: '', estGratuit: false, ordre: 1, idSection: '' })
        api.get(`/ressources/cours/${idCoursChoisi}`).then(res => setRessources(Array.isArray(res.data) ? res.data : []))
      })
      .catch(() => { setLoading(false); setMessage({ type: 'error', texte: 'Erreur lors de l ajout de la ressource. Verifiez le backend.' }) })
  }

  const handleSubmitSection = (e) => {
    e.preventDefault()
    if (!idCoursChoisi) { setMessage({ type: 'error', texte: 'Choisissez un cours !' }); return }
    if (!dataSection.titre.trim()) { setMessage({ type: 'error', texte: 'Le titre de la section est obligatoire !' }); return }

    setLoading(true)
    api.post(`/sections?idCours=${idCoursChoisi}`, dataSection)
      .then(() => {
        setLoading(false)
        setMessage({ type: 'success', texte: 'Section creee avec succes !' })
        setDataSection({ titre: '', description: '', ordre: 1 })
        api.get(`/sections/cours/${idCoursChoisi}`).then(res => setSections(Array.isArray(res.data) ? res.data : []))
      })
      .catch(() => { setLoading(false); setMessage({ type: 'error', texte: 'Erreur lors de la creation de la section.' }) })
  }

  const supprimerRessource = (id, titre) => {
    if (!window.confirm(`Supprimer "${titre}" ?`)) return
    api.delete(`/ressources/${id}`)
      .then(() => {
        setRessources(prev => prev.filter(r => r.idRessource !== id))
        setMessage({ type: 'success', texte: 'Ressource supprimee !' })
      })
      .catch(() => setMessage({ type: 'error', texte: 'Erreur lors de la suppression.' }))
  }

  const iconeType = (type) => {
    const icones = { video: 'bx-play-circle', pdf: 'bx-file-pdf', lien: 'bx-link-external', image: 'bx-image', document: 'bx-file' }
    return icones[type] || 'bx-file'
  }

  return (
    <div className="ressources-page">
      <div className="ressources-header">
        <div className="ressources-header-content">
          <button className="btn-retour" onClick={onRetour}><i className='bx bx-arrow-back'></i>Retour</button>
          <div>
            <h1><i className='bx bx-video-plus'></i>Ajouter des ressources</h1>
            <p>Enrichissez vos cours avec des videos, PDF et liens</p>
          </div>
        </div>
      </div>

      <div className="ressources-container">

        <div className="cours-selector">
          <label><i className='bx bx-book'></i>Selectionnez votre cours</label>

          {loadingCours ? (
            <div className="loading-inline"><div className="mini-spinner"></div> Chargement de vos cours...</div>
          ) : cours.length === 0 ? (
            <div className="empty-cours-warning">
              <i className='bx bx-error-circle'></i>
              Vous n avez encore aucun cours. Allez dans le Menu → Creer un cours d abord.
            </div>
          ) : (
            <select value={idCoursChoisi} onChange={(e) => setIdCoursChoisi(e.target.value)}>
              <option value="">-- Choisir un cours --</option>
              {cours.filter(c => c && c.idCours).map(c => (
                <option key={c.idCours} value={c.idCours}>{c.titre}{c.estPublie ? ' (Publie)' : ' (Brouillon)'}</option>
              ))}
            </select>
          )}

          {idCoursChoisi && (
            <div className="cours-infos-badges">
              <span className="info-badge"><i className='bx bx-layer'></i>{sections.length} section(s)</span>
              <span className="info-badge"><i className='bx bx-file'></i>{ressources.length} ressource(s)</span>
            </div>
          )}
        </div>

        {message.texte && (
          <div className={'alert alert-' + (message.type === 'error' ? 'error' : 'success')}>
            <i className={'bx ' + (message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle')}></i>
            {message.texte}
            <button onClick={() => setMessage({ type: '', texte: '' })}><i className='bx bx-x'></i></button>
          </div>
        )}

        <div className="onglets">
          <button className={'onglet ' + (onglet === 'ressource' ? 'active' : '')} onClick={() => setOnglet('ressource')}><i className='bx bx-plus-circle'></i>Ajouter une ressource</button>
          <button className={'onglet ' + (onglet === 'section' ? 'active' : '')} onClick={() => setOnglet('section')}><i className='bx bx-folder-plus'></i>Creer une section</button>
          <button className={'onglet ' + (onglet === 'liste' ? 'active' : '')} onClick={() => setOnglet('liste')}>
            <i className='bx bx-list-ul'></i>Voir les ressources
            {ressources.length > 0 && <span className="badge-count">{ressources.length}</span>}
          </button>
        </div>

        {onglet === 'ressource' && (
          <div className="onglet-content">
            <form onSubmit={handleSubmitRessource}>
              <div className="form-group">
                <label>Titre de la ressource *</label>
                <div className="input-wrapper"><i className='bx bx-text'></i>
                  <input type="text" name="titre" value={dataRessource.titre} onChange={detectChangeRessource} placeholder="Ex: Introduction aux composants" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={dataRessource.description} onChange={detectChangeRessource} placeholder="Decrivez cette ressource..." rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type de ressource *</label>
                  <select name="typeRessource" value={dataRessource.typeRessource} onChange={detectChangeRessource}>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="lien">Lien externe</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Section *</label>
                  <select name="idSection" value={dataRessource.idSection} onChange={detectChangeRessource}>
                    <option value="">-- Choisir une section --</option>
                    {sections.filter(s => s && s.idSection).map(s => (
                      <option key={s.idSection} value={s.idSection}>{s.ordre}. {s.titre}</option>
                    ))}
                  </select>
                  {sections.length === 0 && idCoursChoisi && (
                    <small className="warning-text">Creez d abord une section dans l onglet "Creer une section"</small>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>URL de la ressource *</label>
                <div className="input-wrapper"><i className='bx bx-link'></i>
                  <input type="text" name="url" value={dataRessource.url} onChange={detectChangeRessource} placeholder="https://... ou /uploads/video.mp4" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duree en secondes</label>
                  <div className="input-wrapper"><i className='bx bx-time'></i>
                    <input type="number" name="duree" value={dataRessource.duree} onChange={detectChangeRessource} placeholder="Ex: 600" min={0} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ordre</label>
                  <div className="input-wrapper"><i className='bx bx-sort'></i>
                    <input type="number" name="ordre" value={dataRessource.ordre} onChange={detectChangeRessource} min={1} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="estGratuit" checked={dataRessource.estGratuit} onChange={detectChangeRessource} />
                  <span><i className='bx bx-gift'></i>Apercu gratuit</span>
                </label>
              </div>
              <button type="submit" className="btn-ajouter" disabled={loading || !idCoursChoisi}>
                {loading ? <div className="spinner"></div> : <><i className='bx bx-plus'></i>Ajouter la ressource</>}
              </button>
            </form>
          </div>
        )}

        {onglet === 'section' && (
          <div className="onglet-content">
            <p className="section-info"><i className='bx bx-info-circle'></i>Une section est un chapitre de votre cours.</p>
            <form onSubmit={handleSubmitSection}>
              <div className="form-group">
                <label>Titre de la section *</label>
                <div className="input-wrapper"><i className='bx bx-text'></i>
                  <input type="text" name="titre" value={dataSection.titre} onChange={detectChangeSection} placeholder="Ex: Introduction et Installation" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={dataSection.description} onChange={detectChangeSection} placeholder="Decrivez le contenu..." rows={3} />
              </div>
              <div className="form-group">
                <label>Ordre</label>
                <div className="input-wrapper"><i className='bx bx-sort'></i>
                  <input type="number" name="ordre" value={dataSection.ordre} onChange={detectChangeSection} min={1} />
                </div>
              </div>
              <button type="submit" className="btn-ajouter" disabled={loading || !idCoursChoisi}>
                {loading ? <div className="spinner"></div> : <><i className='bx bx-folder-plus'></i>Creer la section</>}
              </button>
            </form>
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

        {onglet === 'liste' && (
          <div className="onglet-content">
            {!idCoursChoisi ? (
              <div className="empty-state"><i className='bx bx-mouse-alt'></i><p>Selectionnez un cours d abord</p></div>
            ) : ressources.length === 0 ? (
              <div className="empty-state"><i className='bx bx-file'></i><p>Aucune ressource pour ce cours</p></div>
            ) : (
              <div className="ressources-liste">
                {ressources.map(r => (
                  <div key={r.idRessource} className="ressource-item">
                    <div className="ressource-icon"><i className={'bx ' + iconeType(r.typeRessource)}></i></div>
                    <div className="ressource-info">
                      <h4>{r.titre}</h4>
                      <span className="ressource-type">{r.typeRessource}</span>
                    </div>
                    <button className="btn-supprimer" onClick={() => supprimerRessource(r.idRessource, r.titre)}><i className='bx bx-trash'></i></button>
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
