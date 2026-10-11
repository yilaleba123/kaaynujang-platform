import { Component, signal } from '@angular/core';

interface quiz {
  id: number,
  titre: string,
  statut: string,
}

@Component({
  selector: 'app-quiz',
  imports: [],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css',
})
export class Quiz {
  quizPublies = 21
  quizBrouillon = 16

  quiz = signal<quiz[]>([])
  searchTerm = signal('')
  goToCreateQuiz() {

  }

  filterQuizzes() {

  }

  // Fonction pour  filtrer un quiz

  filteredQuizzes() {
    return this.quiz().filter(q => q.titre.includes(this.searchTerm()))
  }

  // Fonction pour editer un quiz

  editQuiz(id: number) {

  }

  deleteQuiz(id: number) {

  }
}
