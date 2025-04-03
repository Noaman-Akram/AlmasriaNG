import { Component,OnInit } from '@angular/core';
import { LinkService } from '../../link.service';
import {
  NgbAlertModule,
  NgbDatepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

interface paymentmethod {
    name: string,
    code: string
}


interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-finance',
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, Select,MultiSelectModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css'
})
export class FinanceComponent implements OnInit{
  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  constructor(private linkService: LinkService) {
    // Subscribe to changes in isSidebarOpen
    this.linkService.isSidebarOpen$.subscribe((value) => {
      this.isSidebarOpen = value;
    });
    this.todayDate = this.getTodayDate();
  }

  // Function to update margin based on isSidebarOpen
  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }


  ///////////////////////////////////////////////

  todayDate: string;


  // Function to get today's date
  getTodayDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);  // You can change 'en-US' to the desired locale
  }

  cities: City[] | undefined;

    selectedCity: City | undefined;

    ngOnInit() {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
        this.PaymentMethod = [
          {name: 'InstaPay', code: 'IP'},
          {name: 'Cash', code: 'Ca'},
          {name: 'Visa', code: 'Vi'},
          {name: 'Other', code: 'O'}
      ];
    }


    PaymentMethod!: paymentmethod[];

    selectedPaymentMethod!: paymentmethod[];

}
