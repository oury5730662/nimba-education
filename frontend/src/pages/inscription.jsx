import { useState } from 'react'
import api from '../services/api'
import './inscription.css'

function Inscription({ onInscription, allerConnexion }) {
  const [data, setData]       = useState({ nom: '', prenom: '', email: '', motDePasse: '', role: 'apprenant' })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur]   = useState('')
  const [voirMdp, setVoirMdp] = useState(false)

  const detectChange = (e) => setData(a => ({ ...a, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur('')
    if (!data.nom || !data.prenom || !data.email || !data.motDePasse) { setErreur('Remplissez tous les champs !'); return }
    if (data.motDePasse.length < 6) { setErreur('Mot de passe: minimum 6 caracteres !'); return }
    setLoading(true)
    api.post('/auth/inscription', data)
      .then(res => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data))
        setLoading(false)
        onInscription(res.data)
      })
      .catch(err => {
        setLoading(false)
        setErreur(err.response?.data?.erreur || 'Erreur inscription !')
      })
  }

  return (
    <div className="inscription-page">
      <div className="inscription-card">
        <div className="inscription-header">
          <div className="inscription-logo"><i className='bx bx-book-open'></i></div>
          <h1>Creer un compte</h1>
          <p>Rejoignez Nimba Education</p>
        </div>
        {erreur && <div className="alert alert-error"><i className='bx bx-error-circle'></i>{erreur}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <div className="input-wrapper">
                <i className='bx bx-user'></i>
                <input type="text" name="nom" value={data.nom} onChange={detectChange} placeholder="Votre nom" required />
              </div>
            </div>
            <div className="form-group">
              <label>Prenom</label>
              <div className="input-wrapper">
                <i className='bx bx-user'></i>
                <input type="text" name="prenom" value={data.prenom} onChange={detectChange} placeholder="Votre prenom" required />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <i className='bx bx-envelope'></i>
              <input type="email" name="email" value={data.email} onChange={detectChange} placeholder="votre@email.com" required />
            </div>
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <i className='bx bx-lock-alt'></i>
              <input type={voirMdp ? 'text' : 'password'} name="motDePasse" value={data.motDePasse} onChange={detectChange} placeholder="Minimum 6 caracteres" required />
              <button type="button" className="toggle-password" onClick={() => setVoirMdp(!voirMdp)}>
                <i className={`bx ${voirMdp ? 'bx-hide' : 'bx-show'}`}></i>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Je suis</label>
            <div className="role-selector">
              <div className={'role-option ' + (data.role === 'apprenant' ? 'active' : '')} onClick={() => setData(a => ({ ...a, role: 'apprenant' }))}>
                <i className='bx bx-user-check'></i><span>Apprenant</span>
              </div>
              <div className={'role-option ' + (data.role === 'formateur' ? 'active' : '')} onClick={() => setData(a => ({ ...a, role: 'formateur' }))}>
                <i className='bx bx-chalkboard'></i><span>Formateur</span>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-inscription" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className='bx bx-user-plus'></i>Creer mon compte</>}
          </button>
        </form>
        <div className="inscription-footer">
          <p>Deja un compte ? <a href="#" onClick={(e) => { e.preventDefault(); allerConnexion() }}>Se connecter</a></p>
        </div>
      </div>
    </div>
  )
}

export default Inscription
