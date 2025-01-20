import { Component } from '@angular/core';
import { LinkService } from '../../link.service';


@Component({
  selector: 'app-page3',
  imports: [],
  templateUrl: './page3.component.html',
  styleUrl: './page3.component.css'
})
export class Page3Component {
  
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
