import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cree-cours',
  imports: [FormsModule],
  templateUrl: './cree-cours.html',
  styleUrl: './cree-cours.css',
})
export class CreeCours {
  cours = {
    titre: '',
    description: '',
    document: ''
  }
  creeCourse() {

  }
}
