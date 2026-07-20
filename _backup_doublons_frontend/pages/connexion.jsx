import { useState } from 'react'
import api from '../services/api'
import './connexion.css'

function Connexion({ onConnexion, allerInscription }) {
  const [data, setData]       = useState({ email: '', motDePasse: '' })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur]   = useState('')
  const [voirMdp, setVoirMdp] = useState(false)

  const detectChange = (e) => setData(a => ({ ...a, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur('')
    if (!data.email || !data.motDePasse) { setErreur('Remplissez tous les champs !'); return }
    setLoading(true)
    api.post('/auth/connexion', data)
      .then(res => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data))
        setLoading(false)
        onConnexion(res.data)
      })
      .catch(err => {
        setLoading(false)
        setErreur(err.response?.data?.erreur || 'Email ou mot de passe incorrect !')
      })
  }

  return (
    <div className="connexion-page">
      <div className="connexion-card">
        <div className="connexion-header">
          <div className="connexion-logo"><i className='bx bx-book-open'></i></div>
          <h1>ODC E-Learning</h1>
          <p>Connectez-vous a votre compte</p>
        </div>
        {erreur && <div className="alert alert-error"><i className='bx bx-error-circle'></i>{erreur}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adresse email</label>
            <div className="input-wrapper">
              <i className='bx bx-envelope'></i>
              <input type="email" name="email" value={data.email} onChange={detectChange} placeholder="votre@email.com" required />
            </div>
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <i className='bx bx-lock-alt'></i>
              <input type={voirMdp ? 'text' : 'password'} name="motDePasse" value={data.motDePasse} onChange={detectChange} placeholder="Votre mot de passe" required />
              <button type="button" className="toggle-password" onClick={() => setVoirMdp(!voirMdp)}>
                <i className={`bx ${voirMdp ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn-connexion" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className='bx bx-log-in'></i>Se connecter</>}
          </button>
        </form>
        <div className="connexion-footer">
          <p>Pas encore de compte ? <a href="#" onClick={(e) => { e.preventDefault(); allerInscription() }}>S inscrire gratuitement</a></p>
        </div>
      </div>
    </div>
  )
}

export default Connexion
