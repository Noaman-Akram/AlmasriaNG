import { Component } from '@angular/core';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { LinkService } from '../../link.service';


@Component({
  selector: 'app-page2',
  imports: [NgbAlert],
  templateUrl: './page2.component.html',
  styleUrl: './page2.component.css'
})
export class Page2Component {
  
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
