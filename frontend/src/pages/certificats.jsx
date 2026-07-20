import { useState, useEffect } from 'react'
import api, { BACKEND_URL } from '../services/api'
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
            <p>Vos certificats de reussite Nimba Education</p>
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
                <p>Suivez au moins 80% d un cours certifiant et reussissez son quiz final (75/100) pour demander votre certificat</p>
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

                      {cert.statutValidation === 'valide' && (
                        <div className="cert-statut valide">
                          <i className='bx bx-check-shield'></i>
                          Certificat valide
                        </div>
                      )}
                      {cert.statutValidation === 'en_attente' && (
                        <div className="cert-statut en-attente">
                          <i className='bx bx-time-five'></i>
                          En attente de validation du formateur
                        </div>
                      )}
                      {cert.statutValidation === 'refuse' && (
                        <div className="cert-statut invalide">
                          <i className='bx bx-x-circle'></i>
                          Refusé{cert.commentaireValidation ? ` : ${cert.commentaireValidation}` : ''}
                        </div>
                      )}

                      <div className="cert-actions">
                        {cert.statutValidation === 'valide' && cert.urlPdf && (
                          <a
                            className="btn-telecharger"
                            href={`${BACKEND_URL}/api/certificats/${cert.numeroCertificat}/telecharger`}
                          >
                            <i className='bx bx-download'></i>
                            Télécharger le PDF
                          </a>
                        )}
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
                    placeholder="Ex: NIMBA-2026-00001"
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
                    <i className={'bx ' + (certTrouve.statutValidation === 'valide' ? 'bx-check-shield' : 'bx-info-circle')}></i>
                    <h3>
                      {certTrouve.statutValidation === 'valide' && 'Certificat authentique et valide'}
                      {certTrouve.statutValidation === 'en_attente' && 'Demande en attente de validation'}
                      {certTrouve.statutValidation === 'refuse' && 'Demande refusée par le formateur'}
                    </h3>
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