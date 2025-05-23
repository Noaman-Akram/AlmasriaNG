import { LinkService } from './../../link.service';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive} from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService } from '../../sidebar.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink,RouterLinkActive,PanelMenuModule,NgbCollapseModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  constructor(private LinkService: LinkService, private sidebarService: SidebarService) {}

  leftSidebarVisible: boolean = true; // الحالة الافتراضية للـ Left Sidebar

  isSidebarOpen = false; // Tracks whether the sidebar is open
  isCollapsed = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle sidebar state
    this.LinkService.toggleSidebar();
    
  }
  closeSidebar() {
    this.isSidebarOpen = false; // Close the sidebar
  }  

  
}
