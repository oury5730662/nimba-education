// ============================================
// CreationCours.jsx — Page de création de cours
// Permet au formateur de créer un nouveau cours
// ============================================

import { useState, useEffect } from 'react'
import api from '../services/api'
import './creationCours.css'

function CreationCours({ user, onRetour }) {

  // ── États du formulaire ──────────────────
  const [data, setData] = useState({
    titre:            '',
    description:      '',
    contenu:          '',
    imageCouverture:  '',
    niveau:           'debutant',
    dureeEstimee:     '',
    prix:             0,
    estPublie:        false,
    estCertifiant:    false,
    idCategorie:      ''
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [erreur, setErreur]         = useState('')
  const [succes, setSucces]         = useState('')
  const [etape, setEtape]           = useState(1) // Formulaire en étapes

  // ── Charger les catégories ───────────────
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.log('Erreur catégories:', err))
  }, [])

  // ── Détecter les changements ─────────────
  const detectChange = (e) => {
    const { name, value, type, checked } = e.target
    setData(ancien => ({
      ...ancien,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ── Valider étape 1 ──────────────────────
  const validerEtape1 = () => {
    if (!data.titre.trim()) {
      setErreur('Le titre est obligatoire !')
      return false
    }
    if (!data.description.trim()) {
      setErreur('La description est obligatoire !')
      return false
    }
    if (!data.idCategorie) {
      setErreur('Veuillez choisir une catégorie !')
      return false
    }
    setErreur('')
    return true
  }

  // ── Soumettre le formulaire ──────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    api.post(`/cours?idFormateur=${user.id}&idCategorie=${data.idCategorie}`, {
      titre:           data.titre,
      description:     data.description,
      contenu:         data.contenu,
      imageCouverture: data.imageCouverture,
      niveau:          data.niveau,
      dureeEstimee:    data.dureeEstimee ? parseInt(data.dureeEstimee) : null,
      prix:            parseFloat(data.prix) || 0,
      estPublie:       data.estPublie,
      estCertifiant:   data.estCertifiant
    })
      .then(response => {
        setLoading(false)
        if (data.estPublie) {
          setSucces(`Cours "${data.titre}" cree et PUBLIE avec succes ! Il est maintenant visible sur l accueil.`)
        } else {
          setSucces(`Cours "${data.titre}" cree en BROUILLON. Pensez a le publier depuis "Mon espace" pour qu il apparaisse sur l accueil !`)
        }
        setTimeout(() => { onRetour() }, 3000)
      })
      .catch(error => {
        setLoading(false)
        setErreur(
          error.response?.data?.erreur || 'Erreur lors de la création !'
        )
      })
  }

  return (
    <div className="creation-page">

      {/* ── EN-TÊTE ── */}
      <div className="creation-header">
        <div className="creation-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-book-add'></i>
              Créer un cours
            </h1>
            <p>Partagez vos connaissances avec les apprenants ODC</p>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div className="etapes">
          <div className={`etape ${etape >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Informations</p>
          </div>
          <div className="etape-ligne"></div>
          <div className={`etape ${etape >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Détails</p>
          </div>
          <div className="etape-ligne"></div>
          <div className={`etape ${etape >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Publication</p>
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="creation-container">
        {erreur && (
          <div className="alert alert-error">
            <i className='bx bx-error-circle'></i>
            {erreur}
          </div>
        )}
        {succes && (
          <div className="alert alert-success">
            <i className='bx bx-check-circle'></i>
            {succes}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── ÉTAPE 1 : INFORMATIONS DE BASE ── */}
          {etape === 1 && (
            <div className="etape-content">
              <h2>
                <i className='bx bx-info-circle'></i>
                Informations de base
              </h2>

              {/* Titre */}
              <div className="form-group">
                <label>
                  Titre du cours
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <i className='bx bx-text'></i>
                  <input
                    type="text"
                    name="titre"
                    value={data.titre}
                    onChange={detectChange}
                    placeholder="Ex: Introduction à React.js"
                    maxLength={200}
                  />
                </div>
                <small>{data.titre.length}/200</small>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>
                  Description
                  <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={detectChange}
                  placeholder="Décrivez votre cours en quelques phrases..."
                  rows={4}
                />
              </div>

              {/* Catégorie */}
              <div className="form-group">
                <label>
                  Catégorie
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <i className='bx bx-category'></i>
                  <select
                    name="idCategorie"
                    value={data.idCategorie}
                    onChange={detectChange}
                  >
                    <option value="">-- Choisir une catégorie --</option>
                    {categories.map(cat => (
                      <option key={cat.idCategorie} value={cat.idCategorie}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Niveau */}
              <div className="form-group">
                <label>Niveau</label>
                <div className="niveau-selector">
                  {[
                    { value: 'debutant',      label: 'Débutant',      icon: 'bx-signal-1' },
                    { value: 'intermediaire', label: 'Intermédiaire', icon: 'bx-signal-3' },
                    { value: 'avance',        label: 'Avancé',        icon: 'bx-signal-5' },
                  ].map(n => (
                    <div
                      key={n.value}
                      className={`niveau-option ${data.niveau === n.value ? 'active' : ''}`}
                      onClick={() => setData(a => ({ ...a, niveau: n.value }))}
                    >
                      <i className={`bx ${n.icon}`}></i>
                      <span>{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-suivant"
                onClick={() => validerEtape1() && setEtape(2)}
              >
                Suivant
                <i className='bx bx-right-arrow-alt'></i>
              </button>

            </div>
          )}

          {/* ── ÉTAPE 2 : DÉTAILS ── */}
          {etape === 2 && (
            <div className="etape-content">
              <h2>
                <i className='bx bx-detail'></i>
                Détails du cours
              </h2>

              {/* Contenu */}
              <div className="form-group">
                <label>Contenu détaillé</label>
                <textarea
                  name="contenu"
                  value={data.contenu}
                  onChange={detectChange}
                  placeholder="Programme, objectifs pédagogiques..."
                  rows={5}
                />
              </div>

              {/* Image de couverture */}
              <div className="form-group">
                <label>URL de l'image de couverture</label>
                <div className="input-wrapper">
                  <i className='bx bx-image'></i>
                  <input
                    type="text"
                    name="imageCouverture"
                    value={data.imageCouverture}
                    onChange={detectChange}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
                {/* Aperçu image */}
                {data.imageCouverture && (
                  <div className="image-preview">
                    <img
                      src={data.imageCouverture}
                      alt="Aperçu"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Durée et Prix */}
              <div className="form-row">
                <div className="form-group">
                  <label>Durée estimée (minutes)</label>
                  <div className="input-wrapper">
                    <i className='bx bx-time'></i>
                    <input
                      type="number"
                      name="dureeEstimee"
                      value={data.dureeEstimee}
                      onChange={detectChange}
                      placeholder="Ex: 120"
                      min={0}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Prix (GNF) — 0 = Gratuit</label>
                  <div className="input-wrapper">
                    <i className='bx bx-money'></i>
                    <input
                      type="number"
                      name="prix"
                      value={data.prix}
                      onChange={detectChange}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="btn-group">
                <button
                  type="button"
                  className="btn-precedent"
                  onClick={() => setEtape(1)}
                >
                  <i className='bx bx-left-arrow-alt'></i>
                  Précédent
                </button>
                <button
                  type="button"
                  className="btn-suivant"
                  onClick={() => setEtape(3)}
                >
                  Suivant
                  <i className='bx bx-right-arrow-alt'></i>
                </button>
              </div>

            </div>
          )}

          {/* ── ÉTAPE 3 : PUBLICATION ── */}
          {etape === 3 && (
            <div className="etape-content">
              <h2>
                <i className='bx bx-send'></i>
                Options de publication
              </h2>

              {/* Résumé du cours */}
              <div className="cours-resume">
                <h3>Résumé du cours</h3>
                <div className="resume-item">
                  <span>Titre :</span>
                  <strong>{data.titre}</strong>
                </div>
                <div className="resume-item">
                  <span>Niveau :</span>
                  <strong>{data.niveau}</strong>
                </div>
                <div className="resume-item">
                  <span>Durée :</span>
                  <strong>{data.dureeEstimee ? `${data.dureeEstimee} min` : 'Non définie'}</strong>
                </div>
                <div className="resume-item">
                  <span>Prix :</span>
                  <strong>{data.prix > 0 ? `${data.prix} GNF` : 'Gratuit'}</strong>
                </div>
              </div>

              {/* Options */}
              <div className="options-publication">

                <div className="option-card">
                  <div className="option-info">
                    <i className='bx bx-globe'></i>
                    <div>
                      <h4>Publier le cours</h4>
                      <p>Le cours sera visible par tous les apprenants</p>
                    </div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      name="estPublie"
                      checked={data.estPublie}
                      onChange={detectChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="option-card">
                  <div className="option-info">
                    <i className='bx bx-certification'></i>
                    <div>
                      <h4>Cours certifiant</h4>
                      <p>Les apprenants recevront un certificat</p>
                    </div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      name="estCertifiant"
                      checked={data.estCertifiant}
                      onChange={detectChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

              </div>

              <div className="btn-group">
                <button
                  type="button"
                  className="btn-precedent"
                  onClick={() => setEtape(2)}
                >
                  <i className='bx bx-left-arrow-alt'></i>
                  Précédent
                </button>
                <button
                  type="submit"
                  className="btn-publier"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <i className='bx bx-check'></i>
                      Créer le cours
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  )
}

export default CreationCours