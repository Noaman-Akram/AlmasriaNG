import { Component } from '@angular/core';
import { LinkService } from '../../link.service';
import { Customer } from '../../customer';
import { CustomerService } from '../../customer.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-orders',
  imports: [TableModule, CommonModule, ButtonModule, HttpClientModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [CustomerService],
  standalone: true,
})
export class OrdersComponent {
  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  constructor(private linkService: LinkService,private customerService: CustomerService) {
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



  ///////////////////////////////////////////////////////////////////




  customers!: Customer[];

    first = 0;

    rows = 10;

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => (this.customers = customers));
    }

    next() {
        this.first = this.first + this.rows;
    }

    prev() {
        this.first = this.first - this.rows;
    }

    reset() {
        this.first = 0;
    }

    pageChange(event: { first: number; rows: number; }) {
      this.first = event.first;
      this.rows = event.rows;
  }

    isLastPage(): boolean {
        return this.customers ? this.first + this.rows >= this.customers.length : true;
    }

    isFirstPage(): boolean {
        return this.customers ? this.first === 0 : true;
    }
}
