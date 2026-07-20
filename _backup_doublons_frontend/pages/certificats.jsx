import { useState, useEffect } from 'react'
import api from '../services/api'
import './certificats.css'

function Certificats({ user, onRetour }) {

  const [certificats, setCertificats]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [message, setMessage]             = useState({ type: '', texte: '' })
  const [numeroCherche, setNumeroCherche] = useState('')
  const [certTrouve, setCertTrouve]       = useState(null)
  const [onglet, setOnglet]               = useState('mes-certificats')

  useEffect(() => {
    chargerCertificats()
  }, [])

  const chargerCertificats = () => {
    setLoading(true)
    api.get('/certificats/utilisateur/' + user.id)
      .then(res => { setCertificats(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const verifierCertificat = () => {
    if (!numeroCherche.trim()) {
      setMessage({ type: 'error', texte: 'Entrez un numero de certificat !' })
      return
    }
    api.get('/certificats/verifier/' + numeroCherche)
      .then(res => {
        setCertTrouve(res.data)
        setMessage({ type: 'success', texte: 'Certificat valide !' })
      })
      .catch(() => {
        setCertTrouve(null)
        setMessage({ type: 'error', texte: 'Certificat invalide ou introuvable !' })
      })
  }

  const formaterDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="certificats-page">

      <div className="certificats-header">
        <div className="certificats-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>
            Retour
          </button>
          <div>
            <h1>
              <i className='bx bx-certification'></i>
              Mes Certificats
            </h1>
            <p>Vos certificats de reussite ODC E-Learning</p>
          </div>
        </div>
      </div>

      <div className="certificats-container">

        <div className="onglets">
          <button
            className={'onglet ' + (onglet === 'mes-certificats' ? 'active' : '')}
            onClick={() => setOnglet('mes-certificats')}
          >
            <i className='bx bx-medal'></i>
            Mes certificats
            {certificats.length > 0 && (
              <span className="badge-count">{certificats.length}</span>
            )}
          </button>
          <button
            className={'onglet ' + (onglet === 'verifier' ? 'active' : '')}
            onClick={() => setOnglet('verifier')}
          >
            <i className='bx bx-search-alt'></i>
            Verifier un certificat
          </button>
        </div>

        {message.texte && (
          <div className={'alert alert-' + (message.type === 'error' ? 'error' : 'success')}>
            <i className={'bx ' + (message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle')}></i>
            {message.texte}
            <button onClick={() => setMessage({ type: '', texte: '' })}>
              <i className='bx bx-x'></i>
            </button>
          </div>
        )}

        {onglet === 'mes-certificats' && (
          <div className="onglet-content">

            {loading && (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
              </div>
            )}

            {!loading && certificats.length === 0 && (
              <div className="empty-state">
                <i className='bx bx-certification'></i>
                <h3>Aucun certificat pour l instant</h3>
                <p>Terminez un cours certifiant a 100% pour obtenir votre certificat</p>
                <button className="btn-action" onClick={onRetour}>
                  <i className='bx bx-book-open'></i>
                  Voir les cours
                </button>
              </div>
            )}

            {!loading && certificats.length > 0 && (
              <div className="certificats-grid">
                {certificats.map(cert => (
                  <div key={cert.idCertificat} className="certificat-card">

                    <div className="cert-decoration">
                      <div className="cert-icon">
                        <i className='bx bx-certification'></i>
                      </div>
                    </div>

                    <div className="cert-body">
                      <p className="cert-label">Certificat de reussite</p>
                      <h3 className="cert-cours">{cert.cours && cert.cours.titre}</h3>
                      <p className="cert-nom">{user.prenom} {user.nom}</p>

                      <div className="cert-infos">
                        <div className="cert-info-item">
                          <i className='bx bx-calendar'></i>
                          <span>{formaterDate(cert.dateEmission)}</span>
                        </div>
                        <div className="cert-info-item">
                          <i className='bx bx-hash'></i>
                          <span>{cert.numeroCertificat}</span>
                        </div>
                      </div>

                      <div className={'cert-statut ' + (cert.estValide ? 'valide' : 'invalide')}>
                        <i className={'bx ' + (cert.estValide ? 'bx-check-shield' : 'bx-x-circle')}></i>
                        {cert.estValide ? 'Certificat valide' : 'Certificat expire'}
                      </div>

                      <div className="cert-actions">
                        <button
                          className="btn-partager"
                          onClick={() => {
                            navigator.clipboard.writeText(cert.numeroCertificat)
                            setMessage({ type: 'success', texte: 'Numero copie !' })
                          }}
                        >
                          <i className='bx bx-copy'></i>
                          Copier le numero
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {onglet === 'verifier' && (
          <div className="onglet-content">
            <div className="verifier-section">
              <div className="verifier-icon">
                <i className='bx bx-search-alt'></i>
              </div>
              <h2>Verifier un certificat</h2>
              <p>Entrez le numero du certificat pour verifier son authenticite.</p>

              <div className="verifier-form">
                <div className="input-wrapper">
                  <i className='bx bx-hash'></i>
                  <input
                    type="text"
                    value={numeroCherche}
                    onChange={(e) => setNumeroCherche(e.target.value)}
                    placeholder="Ex: ODC-2026-00001"
                  />
                </div>
                <button className="btn-verifier" onClick={verifierCertificat}>
                  <i className='bx bx-search'></i>
                  Verifier
                </button>
              </div>

              {certTrouve && (
                <div className="cert-trouve">
                  <div className="cert-trouve-header">
                    <i className='bx bx-check-shield'></i>
                    <h3>Certificat authentique</h3>
                  </div>
                  <div className="cert-trouve-infos">
                    <div className="info-row">
                      <span>Titulaire :</span>
                      <strong>
                        {certTrouve.utilisateur && certTrouve.utilisateur.prenom + ' ' + certTrouve.utilisateur.nom}
                      </strong>
                    </div>
                    <div className="info-row">
                      <span>Cours :</span>
                      <strong>{certTrouve.cours && certTrouve.cours.titre}</strong>
                    </div>
                    <div className="info-row">
                      <span>Emis le :</span>
                      <strong>{formaterDate(certTrouve.dateEmission)}</strong>
                    </div>
                    <div className="info-row">
                      <span>Numero :</span>
                      <strong>{certTrouve.numeroCertificat}</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Certificats