import { Component, OnInit } from '@angular/core';
import { LinkService } from '../../link.service';
import { 
  NgbAlertModule, 
  NgbDatepickerModule, 
  NgbDateStruct 
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';

interface City {
  name: string,
  code: string
}
interface City2 {
  name: string,
  code: string
}
interface City3 {
  name: string,
  code: string
}
interface City4 {
  name: string,
  code: string
}

interface OrderItem2 {
  marbleMaterial: string;
  amount: number | null;
  cost: number | null;
  totalCost: number;
  dimension: string;
}

@Component({
  selector: 'app-gorder',
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe,CommonModule,MultiSelectModule,Select],
  templateUrl: './gorder.component.html',
  styleUrl: './gorder.component.css'
})
export class GorderComponent implements OnInit {
  cities: City[] | undefined;

  selectedCity: City | undefined;

  cities3: City3[] | undefined;

  selectedCity3: City3 | undefined;

  cities2!: City2[];

    selectedCities2!: City2[];

  cities4!: City4[];

    selectedCities4!: City4[];

  ngOnInit() {
      this.cities = [
          { name: 'New York', code: 'NY' },
          { name: 'Rome', code: 'RM' },
          { name: 'London', code: 'LDN' },
          { name: 'Istanbul', code: 'IST' },
          { name: 'Paris', code: 'PRS' }
      ];
      this.cities3 = [
          { name: 'New York', code: 'NY' },
          { name: 'Rome', code: 'RM' },
          { name: 'London', code: 'LDN' },
          { name: 'Istanbul', code: 'IST' },
          { name: 'Paris', code: 'PRS' }
      ];
      this.cities2 = [
          { name: 'New York', code: 'NY' },
          { name: 'Rome', code: 'RM' },
          { name: 'London', code: 'LDN' },
          { name: 'Istanbul', code: 'IST' },
          { name: 'Paris', code: 'PRS' }
      ];
      this.cities4 = [
          { name: 'New York', code: 'NY' },
          { name: 'Rome', code: 'RM' },
          { name: 'London', code: 'LDN' },
          { name: 'Istanbul', code: 'IST' },
          { name: 'Paris', code: 'PRS' }
      ];
  }
    today: Date = new Date();
    model: NgbDateStruct | undefined;
    marginLeft = 200; // Default margin
    isSidebarOpen = false;

  orderItems2: OrderItem2[] = [];
  
    constructor(private linkService: LinkService) {
      // Subscribe to changes in isSidebarOpen
      this.linkService.isSidebarOpen$.subscribe((value) => {
        this.isSidebarOpen = value;
      });
      this.addRow();
    }
  
    // Function to update margin based on isSidebarOpen
    updateMargin() : number {
      this.marginLeft = this.isSidebarOpen ? 100 : 200;
      return this.marginLeft;
    }


    addRow(): void {
      this.orderItems2.push({
        marbleMaterial: '',
        amount: null,
        cost: null,
        totalCost: 0,
        dimension: 'Unit'
      });
    }
    // Removes an order row based on index
  removeRow(index: number): void {
    if (this.orderItems2.length > 1) {
      this.orderItems2.splice(index, 1);
    }
  }
    // Recalculates the total cost when amount or cost changes
    calculateTotal(index: number): void {
      const item = this.orderItems2[index];
      const amt = item.amount ?? 0;
      const cst = item.cost ?? 0;
      item.totalCost = amt * cst;
    }

}
