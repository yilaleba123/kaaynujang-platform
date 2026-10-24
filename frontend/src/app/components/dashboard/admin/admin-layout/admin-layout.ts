import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../components/admin-header/admin-header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobileOpen = false;
  isMobile = false;

  ngOnInit(): void {
    this.checkViewport();
  }

  @HostListener('window:resize')
  checkViewport(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.isMobileOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    this.isMobileOpen = false;
  }
}
