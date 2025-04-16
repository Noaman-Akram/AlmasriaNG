import { Component, OnInit  } from '@angular/core';
import { LinkService } from '../../link.service';
import { Table } from 'primeng/table';
import { Customer , Representative} from '../../customer';
import { CustomerService } from '../../customer.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ProgressBar } from 'primeng/progressbar';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-orders',
  imports: [TableModule, HttpClientModule, CommonModule, InputTextModule, TagModule,
    SelectModule, MultiSelectModule, ProgressBar, ButtonModule, IconFieldModule, InputIconModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  providers: [CustomerService],
  standalone: true,
})
export class OrdersComponent implements OnInit {

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

    representatives!: Representative[];

    statuses!: any[];

    loading: boolean = true;

    activityValues: number[] = [0, 100];

    searchValue: string | undefined;

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => {
            this.customers = customers;
            this.loading = false;

            this.customers.forEach((customer) => (customer.date = new Date(<Date>customer.date)));
        });

        this.representatives = [
            { name: 'Amy Elsner', image: 'amyelsner.png' },
            { name: 'Anna Fali', image: 'annafali.png' },
            { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
            { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
            { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
            { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
            { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
            { name: 'Onyama Limba', image: 'onyamalimba.png' },
            { name: 'Stephen Shaw', image: 'stephenshaw.png' },
            { name: 'Xuxue Feng', image: 'xuxuefeng.png' }
        ];

        this.statuses = [
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ];
    }

    clear(table: Table) {
        table.clear();
        this.searchValue = ''
    }

    getSeverity(status: string) {
      switch (status?.toLowerCase()) {
          case 'unqualified':
              return 'danger';
  
          case 'qualified':
              return 'success';
  
          case 'new':
              return 'info';
  
          case 'negotiation':
              return 'warn';
  
          case 'renewal':
              return null;
              
          case 'proposal':
              return 'success';
              
          default:
              return null; // Add a default case to handle any other status values
      }
  }
}
