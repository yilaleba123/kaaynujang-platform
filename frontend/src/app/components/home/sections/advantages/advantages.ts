import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-advantages',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './advantages.html',
  styleUrl: './advantages.scss',
})
export class AdvantagesComponent {}
