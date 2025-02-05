import { Component, OnInit } from '@angular/core';
import { LinkService } from '../../link.service';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';

interface City {
  name: string,
  code: string
}

@Component({
  selector: 'app-gorder',
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe,CommonModule,MultiSelectModule],
  templateUrl: './gorder.component.html',
  styleUrl: './gorder.component.css'
})
export class GorderComponent implements OnInit {

  cities!: City[];

  selectedCities!: City[];

  ngOnInit() {
      this.cities = [
          {name: 'New York', code: 'NY'},
          {name: 'Rome', code: 'RM'},
          {name: 'London', code: 'LDN'},
          {name: 'Istanbul', code: 'IST'},
          {name: 'Paris', code: 'PRS'}
      ];
  }
    today: Date = new Date();
    model: NgbDateStruct | undefined;
    marginLeft = 200; // Default margin
    isSidebarOpen = false;
  
    constructor(private linkService: LinkService) {
      // Subscribe to changes in isSidebarOpen
      this.linkService.isSidebarOpen$.subscribe((value) => {
        this.isSidebarOpen = value;
      });
    }
  
    // Function to update margin based on isSidebarOpen
    updateMargin() {
      this.marginLeft = this.isSidebarOpen ? 100 : 200;
      return this.marginLeft;
    }

}
