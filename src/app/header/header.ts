import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule} from 'lucide-angular';


@Component({
  selector: 'app-header',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // On ajoute de petites fonctions pour gerer le sidebar et le menu

  isSidebarOpen = signal(false)
  isUserMenuOpen = signal(false)

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value)
  }

  closeSidebar() {
    this.isSidebarOpen.set(false)
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(value => !value)
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false)
  }

  logout() {

  }
  
}
