// ============================================
// ModifierProfil.jsx — Modification du profil
// Permet à tout utilisateur (apprenant/formateur)
// de modifier son nom, prénom, photo et bio
// ============================================

import { useState } from 'react'
import api, { resolveFileUrl } from '../services/api'
import './modifierProfil.css'

function ModifierProfil({ user, onRetour, onProfilMisAJour }) {

  // ── États du formulaire ──────────────────
  const [data, setData] = useState({
    nom:         user?.nom || '',
    prenom:      user?.prenom || '',
    photoProfil: user?.photoProfil || '',
    bio:         user?.bio || ''
  })

  const [apercuPhoto, setApercuPhoto]     = useState(resolveFileUrl(user?.photoProfil) || '')
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [loading, setLoading]             = useState(false)
  const [erreur, setErreur]               = useState('')
  const [succes, setSucces]               = useState('')

  // ── Détecter les changements ─────────────
  const detectChange = (e) => {
    const { name, value } = e.target
    setData(a => ({ ...a, [name]: value }))
  }

  // ── Upload de la photo de profil ─────────
  const handlePhotoChange = (e) => {
    const fichier = e.target.files[0]
    if (!fichier) return

    // Aperçu local immédiat
    setApercuPhoto(URL.createObjectURL(fichier))
    setErreur('')
    setUploadEnCours(true)

    const formData = new FormData()
    formData.append('file', fichier)

    api.post('/upload/image?dossier=profils', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setUploadEnCours(false)
        setData(a => ({ ...a, photoProfil: res.data.url }))
      })
      .catch(err => {
        setUploadEnCours(false)
        setApercuPhoto(resolveFileUrl(user?.photoProfil) || '')
        setErreur(
          err.response?.data?.erreur || 'Erreur lors de l\'upload de la photo !'
        )
      })
  }

  // ── Soumettre le formulaire ──────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    if (!data.nom.trim() || !data.prenom.trim()) {
      setErreur('Le nom et le prénom sont obligatoires !')
      return
    }

    setLoading(true)
    api.put(`/utilisateurs/${user.id}`, {
      nom:         data.nom,
      prenom:      data.prenom,
      photoProfil: data.photoProfil,
      bio:         data.bio
    })
      .then(res => {
        setLoading(false)
        setSucces('✅ Profil mis à jour avec succès !')

        // Fusionner avec le user existant (conserve token, email, role...)
        const utilisateurMisAJour = {
          ...user,
          nom:         res.data.nom,
          prenom:      res.data.prenom,
          photoProfil: res.data.photoProfil,
          bio:         res.data.bio
        }
        localStorage.setItem('user', JSON.stringify(utilisateurMisAJour))
        if (onProfilMisAJour) onProfilMisAJour(utilisateurMisAJour)
      })
      .catch(err => {
        setLoading(false)
        setErreur(
          err.response?.data?.erreur || 'Erreur lors de la mise à jour du profil !'
        )
      })
  }

  return (
    <div className="modifier-profil-page">

      {/* ── EN-TÊTE ── */}
      <div className="modifier-profil-header">
        <div className="modifier-profil-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-user-circle'></i>
              Modifier mon profil
            </h1>
            <p>Mettez à jour vos informations personnelles</p>
          </div>
        </div>
      </div>

      <div className="modifier-profil-container">

        {/* ── MESSAGES ── */}
        {erreur && (
          <div className="alert alert-error">
            <i className='bx bx-error-circle'></i>
            {erreur}
            <button onClick={() => setErreur('')}>
              <i className='bx bx-x'></i>
            </button>
          </div>
        )}
        {succes && (
          <div className="alert alert-success">
            <i className='bx bx-check-circle'></i>
            {succes}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Photo de profil */}
          <div className="form-group">
            <label>Photo de profil</label>
            <div className="photo-profil-zone">
              <div className="photo-profil-apercu">
                {apercuPhoto
                  ? <img src={apercuPhoto} alt="Aperçu" />
                  : <i className='bx bx-user'></i>}
              </div>
              <label className="upload-zone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
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
                    <span>Changer la photo (jpg, png, webp — max 5 Mo)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Nom / Prénom */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Nom
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <i className='bx bx-user'></i>
                <input
                  type="text"
                  name="nom"
                  value={data.nom}
                  onChange={detectChange}
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                Prénom
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <i className='bx bx-user'></i>
                <input
                  type="text"
                  name="prenom"
                  value={data.prenom}
                  onChange={detectChange}
                  placeholder="Votre prénom"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={data.bio}
              onChange={detectChange}
              placeholder="Parlez un peu de vous..."
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn-enregistrer"
            disabled={loading || uploadEnCours}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <i className='bx bx-save'></i>
                Enregistrer les modifications
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}

export default ModifierProfil
