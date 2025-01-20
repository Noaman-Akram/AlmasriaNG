import { Component } from '@angular/core';
import { LinkService } from '../../link.service';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-ard-s3r',
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe,CommonModule],
  templateUrl: './ard-s3r.component.html',
  styleUrl: './ard-s3r.component.css'
})
export class ArdS3rComponent {
  today: Date = new Date();
  model: NgbDateStruct | undefined;
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
