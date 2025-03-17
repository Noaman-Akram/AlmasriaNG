// ard-s3r.component.ts
import { Component , inject, OnInit } from '@angular/core';
import { LinkService } from '../../link.service';
import {
  NgbAlertModule,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { Order } from '../../services/supabase.service';
import { SupabaseService } from '../../services/supabase.service';
import { Injector } from '@angular/core';

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

// Define an interface for your order row
interface OrderItem {
  marbleMaterial: string;
  amount: number | null;
  cost: number | null;
  totalCost: number;
  dimension: string;
}

@Component({
  selector: 'app-ard-s3r',
  // Include needed modules in the imports array (Angular 14+/standalone syntax)
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe, CommonModule,MultiSelectModule,Select],
  templateUrl: './ard-s3r.component.html',
  styleUrls: ['./ard-s3r.component.css']
})
export class ArdS3rComponent implements OnInit {
  order!:Order;

 private supabaseService! : SupabaseService;

  cities3: City3[] | undefined;

    selectedCity3: City3 | undefined;

  cities2: City3[] | undefined;

    selectedCity2: City3 | undefined;

  cities!: City[];

    selectedCities!: City2[];




    constructor(private linkService: LinkService, private injector: Injector) {


      // Subscribe to sidebar open/close events
      this.linkService.isSidebarOpen$.subscribe((value) => {
        this.isSidebarOpen = value;
      });
      // Initialize with one row
      this.addRow();
    }

    ngOnInit() {


        this.cities = [
            {name: 'New York', code: 'NY'},
            {name: 'Rome', code: 'RM'},
            {name: 'London', code: 'LDN'},
            {name: 'Istanbul', code: 'IST'},
            {name: 'Paris', code: 'PRS'}
        ];
        this.cities2 = [
          {name: 'New York', code: 'NY'},
          {name: 'Rome', code: 'RM'},
          {name: 'London', code: 'LDN'},
          {name: 'Istanbul', code: 'IST'},
          {name: 'Paris', code: 'PRS'}
      ];

      this.cities3 = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    console.log('from component , sb is injecting .....');


    this.supabaseService = this.injector.get(SupabaseService);
    console.log('from component , sb injected!');
    }
  
  today: Date = new Date();
  model: NgbDateStruct | undefined;
  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  // Our dynamic order items array
  orderItems: OrderItem[] = [];
//, private supabaseService: SupabaseService when i add this the app doesnt load 

  // Updates margin based on sidebar state
  updateMargin(): number {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }
  // Adds a new order row with default values
  addRow(): void {
    this.orderItems.push({
      marbleMaterial: '',
      amount: null,
      cost: null,
      totalCost: 0,
      dimension: 'Unit'
    });
  }
  // Removes an order row based on index
removeRow(index: number): void {
  if (this.orderItems.length > 1) {
    this.orderItems.splice(index, 1);
  }
}
  // Recalculates the total cost when amount or cost changes
  calculateTotal(index: number): void {
    const item = this.orderItems[index];
    const amt = item.amount ?? 0;
    const cst = item.cost ?? 0;
    item.totalCost = amt * cst;
  }
  get grandTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.totalCost, 0);
  }

  newOrder = {

    customer_id: null,
    customer_name: 'moh fthy',
    work_type: 'F',
    address: 'helawa',
    order_status: 'install'
  }
  addTestOrder(){
    this.supabaseService.insertToDB('Orders', this.newOrder) 
    .then(order => console.log("Inserted Order:", order))
  .catch(err => console.error(err));
  }
/* 
    addTestOrder() {
    const newOrder: Order = {
      id: Math.floor(Math.random() * 1000), // Use a random ID for now
      customer_id: null,
      customer_name: 'cx name',
      work_type: 'K',
      address: 'helwna',
      order_status: 'cutting'
    };
      
    this.supabaseService.addOrder(newOrder).then(() => {
      console.log('Order added successfully');
    }).catch(error => {
      console.error('Failed to add customer', error);
    });
  }   */

    
  
}
