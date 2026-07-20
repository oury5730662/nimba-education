package com.odc.elearning.service;

import com.odc.elearning.entity.*;
import com.odc.elearning.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// ================================================================
// QuizService
// ================================================================

@Service
public class QuizService {

    @Autowired private QuizRepository quizRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ReponseRepository reponseRepository;
    @Autowired private TentativeQuizRepository tentativeRepository;
    @Autowired private ReponseApprenantRepository reponseApprenantRepository;
    @Autowired private CoursRepository coursRepository;
    @Autowired private SectionCoursRepository sectionRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    public Quiz creerQuiz(Quiz quiz, Integer idCours, Integer idSection) {
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new RuntimeException("Cours introuvable !"));
        quiz.setCours(cours);
        if (idSection != null) {
            SectionCours section = sectionRepository.findById(idSection)
                    .orElseThrow(() -> new RuntimeException("Section introuvable !"));
            quiz.setSection(section);
        }
        return quizRepository.save(quiz);
    }

    public List<Quiz> listerParCours(Integer idCours) {
        return quizRepository.findByCoursIdCours(idCours);
    }

    public Quiz trouverParId(Integer id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz introuvable !"));
    }

    public Question ajouterQuestion(Question question, Integer idQuiz) {
        Quiz quiz = trouverParId(idQuiz);
        question.setQuiz(quiz);
        return questionRepository.save(question);
    }

    public List<Question> listerQuestions(Integer idQuiz) {
        return questionRepository.findByQuizIdQuizOrderByOrdreAsc(idQuiz);
    }

    public Reponse ajouterReponse(Reponse reponse, Integer idQuestion) {
        Question question = questionRepository.findById(idQuestion)
                .orElseThrow(() -> new RuntimeException("Question introuvable !"));
        reponse.setQuestion(question);
        return reponseRepository.save(reponse);
    }

    public List<Reponse> listerReponses(Integer idQuestion) {
        return reponseRepository.findByQuestionIdQuestionOrderByOrdreAsc(idQuestion);
    }

    // Soumettre une tentative de quiz
    public TentativeQuiz soumettreTentative(Integer idUtilisateur, Integer idQuiz,
                                             List<ReponseApprenant> reponsesApprenant) {
        Quiz quiz = trouverParId(idQuiz);
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable !"));

        // Vérifier le nombre de tentatives
        long nbTentatives = tentativeRepository
                .countByUtilisateurIdUtilisateurAndQuizIdQuiz(idUtilisateur, idQuiz);
        if (nbTentatives >= quiz.getNbTentatives()) {
            throw new RuntimeException("Nombre maximum de tentatives atteint !");
        }

        // Créer la tentative
        TentativeQuiz tentative = new TentativeQuiz();
        tentative.setUtilisateur(utilisateur);
        tentative.setQuiz(quiz);
        tentative.setDateDebut(LocalDateTime.now());
        TentativeQuiz savedTentative = tentativeRepository.save(tentative);

        // Calculer le score
        double totalPoints = 0;
        double pointsObtenus = 0;

        for (ReponseApprenant ra : reponsesApprenant) {
            Question question = questionRepository.findById(ra.getQuestion().getIdQuestion())
                    .orElse(null);
            if (question == null) continue;

            totalPoints += question.getPoints().doubleValue();
            ra.setTentative(savedTentative);

            if (ra.getReponse() != null) {
                Reponse reponse = reponseRepository.findById(ra.getReponse().getIdReponse())
                        .orElse(null);
                if (reponse != null && reponse.getEstCorrecte()) {
                    pointsObtenus += question.getPoints().doubleValue();
                }
                ra.setReponse(reponse);
            }
            reponseApprenantRepository.save(ra);
        }

        // Score en pourcentage
        double scorePct = totalPoints > 0 ? (pointsObtenus / totalPoints) * 100 : 0;
        savedTentative.setScoreObtenu(BigDecimal.valueOf(scorePct));
        savedTentative.setEstReussi(scorePct >= quiz.getNotePassage().doubleValue());
        savedTentative.setDateFin(LocalDateTime.now());

        return tentativeRepository.save(savedTentative);
    }

    public void supprimerQuiz(Integer id) {
        quizRepository.deleteById(id);
    }
}
