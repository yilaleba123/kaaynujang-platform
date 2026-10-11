import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  formateur = {
    nom: 'Fall',
    prenom: 'Omar',
  }

  coursPublies = 24
  coursBrouillon = 56
  apprenantsInscrits = 509
  evaluations = 38



  goToCreateCourse() {
    
  }

  filterCourses() {

  }

  goToCorrections() {

  }

}
