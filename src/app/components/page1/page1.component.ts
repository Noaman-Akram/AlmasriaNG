import { Component,Input } from '@angular/core';
import { LinkService } from '../../link.service';


@Component({
  selector: 'app-page1',
  imports: [],
  templateUrl: './page1.component.html',
  styleUrl: './page1.component.css'
})
export class Page1Component {
  marginLeft = 300; // Default margin
  isSidebarOpen = false;

  constructor(private linkService: LinkService) {
    // Subscribe to changes in isSidebarOpen
    this.linkService.isSidebarOpen$.subscribe((value) => {
      this.isSidebarOpen = value;
    });
  }

  // Function to update margin based on isSidebarOpen
  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 300;
    return this.marginLeft;
  }
}
