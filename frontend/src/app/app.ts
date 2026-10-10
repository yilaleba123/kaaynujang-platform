import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Composant principal de l'application
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
