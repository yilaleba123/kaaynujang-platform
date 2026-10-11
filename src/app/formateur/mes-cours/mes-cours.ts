import { Component, computed, signal } from '@angular/core';

interface cours {
  id: number
  titre: string,
  statut: string,
  document: string
}

@Component({
  selector: 'app-mes-cours',
  imports: [],
  templateUrl: './mes-cours.html',
  styleUrl: './mes-cours.css',
})
export class MesCours {
  
  coursPublies = 15
  coursBrouillon = 4

  cours = signal<cours[]>([])
  searchTerm = signal<string>('')

  goToCreateCourse() {

  }

  filterCourses() {

  }

  goToEditCourse(id: number) {

  }

  deleteCourse(id: number) {

  }

  filteredCourses = computed(() => {
    return this.cours().filter(c => c.titre.includes(this.searchTerm()))
  })
}
