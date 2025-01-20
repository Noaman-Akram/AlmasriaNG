import { Component } from '@angular/core';
import { LinkService } from '../../link.service';

@Component({
  selector: 'app-page4',
  imports: [],
  templateUrl: './page4.component.html',
  styleUrl: './page4.component.css'
})
export class Page4Component {
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
