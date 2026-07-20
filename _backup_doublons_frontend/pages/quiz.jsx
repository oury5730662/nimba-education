import { useState, useEffect } from 'react'
import api from '../services/api'
import './quiz.css'

function Quiz({ user, onRetour }) {
  const [onglet, setOnglet]               = useState('liste')
  const [cours, setCours]                 = useState([])
  const [quiz, setQuiz]                   = useState([])
  const [questions, setQuestions]         = useState([])
  const [idCoursChoisi, setIdCoursChoisi] = useState('')
  const [idQuizChoisi, setIdQuizChoisi]   = useState(null)
  const [loading, setLoading]             = useState(false)
  const [message, setMessage]             = useState({ type: '', texte: '' })
  const [tentative, setTentative]         = useState(null)
  const [reponsesChoisies, setReponsesChoisies] = useState({})
  const [resultat, setResultat]           = useState(null)

  const [dataQuiz, setDataQuiz] = useState({ titre: '', description: '', dureeLimit: '', notePassage: 60, nbTentatives: 3 })
  const [dataQuestion, setDataQuestion] = useState({
    enonce: '', typeQuestion: 'choix_unique', points: 1,
    reponses: [
      { contenu: '', estCorrecte: false },
      { contenu: '', estCorrecte: false },
      { contenu: '', estCorrecte: true },
      { contenu: '', estCorrecte: false },
    ]
  })

  // ── Charger la liste des cours au demarrage ──────────────
  useEffect(() => {
    if (!user) return
    const url = user.role === 'formateur' ? `/cours/formateur/${user.id}` : '/cours/publies'
    api.get(url)
      .then(res => setCours(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCours([]))
  }, [user])

  // ── Charger les quiz quand un cours est choisi ───────────
  useEffect(() => {
    if (idCoursChoisi) {
      api.get(`/quiz/cours/${idCoursChoisi}`)
        .then(res => setQuiz(Array.isArray(res.data) ? res.data : []))
        .catch(() => setQuiz([]))
    } else {
      setQuiz([])
    }
  }, [idCoursChoisi])

  // ── Charger les questions + reponses d'un quiz ───────────
  const chargerQuestions = (idQuiz) => {
    if (!idQuiz || isNaN(idQuiz)) return
    setIdQuizChoisi(idQuiz)
    api.get(`/quiz/${idQuiz}/questions`)
      .then(res => {
        const qs = Array.isArray(res.data) ? res.data : []
        if (qs.length === 0) { setQuestions([]); return }
        Promise.all(
          qs.map(q =>
            api.get(`/quiz/questions/${q.idQuestion}/reponses`)
              .then(r => ({ ...q, reponses: Array.isArray(r.data) ? r.data : [] }))
              .catch(() => ({ ...q, reponses: [] }))
          )
        ).then(qsAvecRep => setQuestions(qsAvecRep))
      })
      .catch(() => setQuestions([]))
  }

  const detectChangeQuiz = (e) => setDataQuiz(a => ({ ...a, [e.target.name]: e.target.value }))

  const modifierReponse = (i, field, value) => {
    const rep = [...dataQuestion.reponses]
    rep[i] = { ...rep[i], [field]: value }
    if (field === 'estCorrecte' && value && dataQuestion.typeQuestion === 'choix_unique') {
      rep.forEach((r, idx) => { if (idx !== i) rep[idx] = { ...r, estCorrecte: false } })
    }
    setDataQuestion(a => ({ ...a, reponses: rep }))
  }

  const handleSubmitQuiz = (e) => {
    e.preventDefault()
    if (!idCoursChoisi) { setMessage({ type: 'error', texte: 'Choisissez un cours !' }); return }
    setLoading(true)
    api.post(`/quiz?idCours=${idCoursChoisi}`, {
      titre: dataQuiz.titre,
      description: dataQuiz.description,
      dureeLimit: dataQuiz.dureeLimit ? parseInt(dataQuiz.dureeLimit) : null,
      notePassage: parseFloat(dataQuiz.notePassage) || 60,
      nbTentatives: parseInt(dataQuiz.nbTentatives) || 3
    })
      .then(res => {
        setLoading(false)
        setMessage({ type: 'success', texte: 'Quiz cree !' })
        setDataQuiz({ titre: '', description: '', dureeLimit: '', notePassage: 60, nbTentatives: 3 })
        const nouvelIdQuiz = res.data && res.data.idQuiz
        api.get(`/quiz/cours/${idCoursChoisi}`).then(r => setQuiz(Array.isArray(r.data) ? r.data : []))
        if (nouvelIdQuiz) {
          setIdQuizChoisi(nouvelIdQuiz)
          setOnglet('questions')
        } else {
          setOnglet('liste')
        }
      })
      .catch(() => { setLoading(false); setMessage({ type: 'error', texte: 'Erreur creation quiz !' }) })
  }

  const handleSubmitQuestion = (e) => {
    e.preventDefault()
    if (!idQuizChoisi) { setMessage({ type: 'error', texte: 'Selectionnez un quiz !' }); return }
    setLoading(true)
    api.post(`/quiz/${idQuizChoisi}/questions`, {
      enonce: dataQuestion.enonce,
      typeQuestion: dataQuestion.typeQuestion,
      points: parseFloat(dataQuestion.points) || 1
    })
      .then(res => {
        const idQ = res.data && res.data.idQuestion
        if (!idQ) return Promise.resolve()
        return Promise.all(
          dataQuestion.reponses
            .filter(r => r.contenu.trim())
            .map(r => api.post(`/quiz/questions/${idQ}/reponses`, r))
        )
      })
      .then(() => {
        setLoading(false)
        setMessage({ type: 'success', texte: 'Question ajoutee !' })
        setDataQuestion({
          enonce: '', typeQuestion: 'choix_unique', points: 1,
          reponses: [
            { contenu: '', estCorrecte: false },
            { contenu: '', estCorrecte: false },
            { contenu: '', estCorrecte: true },
            { contenu: '', estCorrecte: false }
          ]
        })
        chargerQuestions(idQuizChoisi)
      })
      .catch(() => { setLoading(false); setMessage({ type: 'error', texte: 'Erreur ajout question !' }) })
  }

  const demarrerQuiz = (q) => {
    if (!q || !q.idQuiz) return
    setTentative(q)
    setReponsesChoisies({})
    setResultat(null)
    chargerQuestions(q.idQuiz)
    setOnglet('passer')
  }

  const soumettreQuiz = () => {
    if (!tentative || !tentative.idQuiz || !user) return
    const reponses = Object.entries(reponsesChoisies).map(([idQ, idR]) => ({
      question: { idQuestion: parseInt(idQ) },
      reponse: { idReponse: parseInt(idR) }
    }))
    api.post(`/quiz/${tentative.idQuiz}/soumettre?idUtilisateur=${user.id}`, reponses)
      .then(res => { setResultat(res.data); setOnglet('resultat') })
      .catch(() => setMessage({ type: 'error', texte: 'Erreur soumission !' }))
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-header-content">
          <button className="btn-retour" onClick={onRetour}>
            <i className='bx bx-arrow-back'></i>Retour
          </button>
          <div>
            <h1><i className='bx bx-question-mark'></i>Quiz</h1>
            <p>{user && user.role === 'formateur' ? 'Creez et gerez vos quiz' : 'Testez vos connaissances'}</p>
          </div>
        </div>
      </div>

      <div className="quiz-container">

        <div className="cours-selector">
          <label><i className='bx bx-book'></i>Selectionnez un cours</label>
          <select value={idCoursChoisi} onChange={(e) => setIdCoursChoisi(e.target.value)}>
            <option value="">-- Choisir un cours --</option>
            {cours.filter(c => c && c.idCours).map(c => (
              <option key={c.idCours} value={c.idCours}>{c.titre}</option>
            ))}
          </select>
        </div>

        {message.texte && (
          <div className={'alert alert-' + (message.type === 'error' ? 'error' : 'success')}>
            <i className={'bx ' + (message.type === 'error' ? 'bx-error-circle' : 'bx-check-circle')}></i>
            {message.texte}
            <button onClick={() => setMessage({ type: '', texte: '' })}><i className='bx bx-x'></i></button>
          </div>
        )}

        <div className="onglets">
          <button className={'onglet ' + (onglet === 'liste' ? 'active' : '')} onClick={() => setOnglet('liste')}>
            <i className='bx bx-list-ul'></i>Liste des quiz
          </button>
          {user && user.role === 'formateur' && (
            <>
              <button className={'onglet ' + (onglet === 'creer' ? 'active' : '')} onClick={() => setOnglet('creer')}>
                <i className='bx bx-plus-circle'></i>Creer un quiz
              </button>
              <button className={'onglet ' + (onglet === 'questions' ? 'active' : '')} onClick={() => setOnglet('questions')}>
                <i className='bx bx-help-circle'></i>Ajouter questions
              </button>
            </>
          )}
        </div>

        {/* ONGLET LISTE */}
        {onglet === 'liste' && (
          <div className="onglet-content">
            {!idCoursChoisi ? (
              <div className="empty-state"><i className='bx bx-book'></i><h3>Selectionnez un cours d abord</h3></div>
            ) : quiz.length === 0 ? (
              <div className="empty-state"><i className='bx bx-question-mark'></i><h3>Aucun quiz pour ce cours</h3></div>
            ) : (
              <div className="quiz-grid">
                {quiz.filter(q => q && q.idQuiz).map(q => (
                  <div key={q.idQuiz} className="quiz-card">
                    <div className="quiz-card-header">
                      <div className="quiz-icon"><i className='bx bx-brain'></i></div>
                      <div><h3>{q.titre}</h3><p>{q.description}</p></div>
                    </div>
                    <div className="quiz-card-infos">
                      <span><i className='bx bx-target-lock'></i>{q.notePassage}% pour reussir</span>
                      <span><i className='bx bx-refresh'></i>{q.nbTentatives} tentatives</span>
                    </div>
                    <div className="quiz-card-actions">
                      {user && user.role === 'formateur' ? (
                        <button className="btn-action" onClick={() => { chargerQuestions(q.idQuiz); setOnglet('questions') }}>
                          <i className='bx bx-edit'></i>Gerer les questions
                        </button>
                      ) : (
                        <button className="btn-action btn-passer" onClick={() => demarrerQuiz(q)}>
                          <i className='bx bx-play'></i>Passer le quiz
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET CREER */}
        {onglet === 'creer' && user && user.role === 'formateur' && (
          <div className="onglet-content">
            <form onSubmit={handleSubmitQuiz}>
              <div className="form-group">
                <label>Titre du quiz *</label>
                <div className="input-wrapper">
                  <i className='bx bx-text'></i>
                  <input type="text" name="titre" value={dataQuiz.titre} onChange={detectChangeQuiz} placeholder="Titre du quiz" required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={dataQuiz.description} onChange={detectChangeQuiz} placeholder="Description..." rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Note de passage (%)</label>
                  <div className="input-wrapper">
                    <i className='bx bx-target-lock'></i>
                    <input type="number" name="notePassage" value={dataQuiz.notePassage} onChange={detectChangeQuiz} min={0} max={100} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tentatives</label>
                  <div className="input-wrapper">
                    <i className='bx bx-refresh'></i>
                    <input type="number" name="nbTentatives" value={dataQuiz.nbTentatives} onChange={detectChangeQuiz} min={1} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Duree (min)</label>
                  <div className="input-wrapper">
                    <i className='bx bx-time'></i>
                    <input type="number" name="dureeLimit" value={dataQuiz.dureeLimit} onChange={detectChangeQuiz} placeholder="Optionnel" />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-action" disabled={loading || !idCoursChoisi}>
                {loading ? <div className="spinner"></div> : <><i className='bx bx-check'></i>Creer le quiz</>}
              </button>
            </form>
          </div>
        )}

        {/* ONGLET QUESTIONS */}
        {onglet === 'questions' && user && user.role === 'formateur' && (
          <div className="onglet-content">
            <div className="form-group">
              <label>Quiz concerne</label>
              <select
                value={idQuizChoisi || ''}
                onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) chargerQuestions(v) }}
              >
                <option value="">-- Choisir un quiz --</option>
                {quiz.filter(q => q && q.idQuiz).map(q => (
                  <option key={q.idQuiz} value={q.idQuiz}>{q.titre}</option>
                ))}
              </select>
            </div>

            {idQuizChoisi && (
              <form onSubmit={handleSubmitQuestion}>
                <div className="form-group">
                  <label>Enonce de la question *</label>
                  <textarea
                    value={dataQuestion.enonce}
                    onChange={(e) => setDataQuestion(a => ({ ...a, enonce: e.target.value }))}
                    placeholder="Posez votre question..."
                    rows={3}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={dataQuestion.typeQuestion}
                      onChange={(e) => setDataQuestion(a => ({ ...a, typeQuestion: e.target.value }))}
                    >
                      <option value="choix_unique">Choix unique</option>
                      <option value="choix_multiple">Choix multiple</option>
                      <option value="vrai_faux">Vrai / Faux</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      value={dataQuestion.points}
                      onChange={(e) => setDataQuestion(a => ({ ...a, points: e.target.value }))}
                      min={0.5} step={0.5}
                    />
                  </div>
                </div>
                <div className="reponses-section">
                  <label>Reponses</label>
                  <p className="reponses-info"><i className='bx bx-info-circle'></i>Cochez la bonne reponse</p>
                  {dataQuestion.reponses.map((rep, i) => (
                    <div key={i} className="reponse-item">
                      <input
                        type={dataQuestion.typeQuestion === 'choix_multiple' ? 'checkbox' : 'radio'}
                        checked={rep.estCorrecte}
                        onChange={(e) => modifierReponse(i, 'estCorrecte', e.target.checked)}
                        name="rep-correcte"
                      />
                      <input
                        type="text"
                        value={rep.contenu}
                        onChange={(e) => modifierReponse(i, 'contenu', e.target.value)}
                        placeholder={`Reponse ${i + 1}`}
                        className="reponse-input"
                      />
                      {rep.estCorrecte && <span className="badge-correcte"><i className='bx bx-check'></i>Correcte</span>}
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-action" disabled={loading}>
                  {loading ? <div className="spinner"></div> : <><i className='bx bx-plus'></i>Ajouter la question</>}
                </button>
              </form>
            )}

            {questions.length > 0 && (
              <div className="questions-liste">
                <h3>Questions ({questions.length})</h3>
                {questions.map((q, i) => (
                  <div key={q.idQuestion || i} className="question-item">
                    <span className="question-numero">{i + 1}</span>
                    <div className="question-info">
                      <p>{q.enonce}</p>
                      <span>{q.typeQuestion} — {q.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET PASSER */}
        {onglet === 'passer' && tentative && (
          <div className="onglet-content">
            <div className="quiz-passer-header">
              <h2>{tentative.titre}</h2>
              <div className="quiz-passer-infos">
                <span><i className='bx bx-target-lock'></i>{tentative.notePassage}% pour reussir</span>
              </div>
            </div>
            {questions.map((q, i) => (
              <div key={q.idQuestion || i} className="question-card">
                <div className="question-header">
                  <span className="question-numero">{i + 1}</span>
                  <p>{q.enonce}</p>
                  <span className="question-points">{q.points} pt(s)</span>
                </div>
                <div className="reponses-liste">
                  {(q.reponses || []).map(r => (
                    <label key={r.idReponse} className="reponse-choix">
                      <input
                        type="radio"
                        name={`q-${q.idQuestion}`}
                        value={r.idReponse}
                        checked={reponsesChoisies[q.idQuestion] === r.idReponse}
                        onChange={() => setReponsesChoisies(p => ({ ...p, [q.idQuestion]: r.idReponse }))}
                      />
                      <span>{r.contenu}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn-soumettre" onClick={soumettreQuiz}>
              <i className='bx bx-send'></i>Soumettre le quiz
            </button>
          </div>
        )}

        {/* ONGLET RESULTAT */}
        {onglet === 'resultat' && resultat && (
          <div className="onglet-content">
            <div className={'resultat-card ' + (resultat.estReussi ? 'reussi' : 'echoue')}>
              <div className="resultat-icon">
                <i className={'bx ' + (resultat.estReussi ? 'bx-trophy' : 'bx-x-circle')}></i>
              </div>
              <h2>{resultat.estReussi ? 'Bravo !' : 'Essayez encore !'}</h2>
              <div className="score-cercle">
                <span className="score-valeur">{Math.round(resultat.scoreObtenu || 0)}%</span>
                <span className="score-label">Score obtenu</span>
              </div>
              <p>{resultat.estReussi ? 'Vous avez reussi ce quiz !' : 'Vous n avez pas atteint le score minimum.'}</p>
              <button className="btn-action" onClick={() => setOnglet('liste')}>
                <i className='bx bx-list-ul'></i>Retour aux quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Quiz
