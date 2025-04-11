import { Component } from '@angular/core';
import { LinkService } from '../../link.service';
import { Order, SupabaseService } from '../../services/supabase.service';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-orders',
  imports: [TableModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  orders = [
    { customer_name: 'Laoding...', work_type: 'Laoding...', order_status: 'Laoding...', address: 'Laoding...' },
    { customer_name: 'dizzyFake', work_type: 'data fale...', order_status: 'ttty', address: 'Gamb betk' }
  
  ];
  
  displayedColumns: string[] = ['id', 'customer_id', 'customer_name', 'work_type', 'order_status', 'address'];

  ngOnInit(){
  this.fetchOrders();
  }
  constructor(private linkService: LinkService, private supabaseService: SupabaseService) {
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
  
  
  fetchOrders() {
    this.supabaseService.retrieveDB<Order>('Orders')  // Specify the type here
      .then((orders: Order[]) => {
        console.log('Fetched in Orders Page!');  // Log the confirm to see if data is coming through
        this.orders = orders;  // Set the fetched orders to the component's orders array
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
      });
  }
  

}

