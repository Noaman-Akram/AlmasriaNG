import { ChangeDetectorRef, Component, type OnInit } from "@angular/core";
import { LinkService } from "../../link.service";
import type { Table } from "primeng/table";
import { TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectModule } from "primeng/select";
import { ProgressBarModule } from "primeng/progressbar";
import { HttpClientModule } from "@angular/common/http";
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from "@angular/forms";
import { SidebarModule } from "primeng/sidebar";
import { SliderModule } from "primeng/slider";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import type { SortEvent } from "primeng/api";
import { Measurement, SupabaseService, type Order } from "../../services/supabase.service"; // Updated import
import { ReactiveFormsModule } from "@angular/forms";
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';



@Component({
  selector: "app-orders",
  imports: [ 
    DropdownModule,
    InputNumberModule,
    ReactiveFormsModule ,
    TableModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ProgressBarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SidebarModule,
    SliderModule,
    CalendarModule,
    CheckboxModule
  ],
  templateUrl: "./orders.component.html",
  styleUrl: "./orders.component.css",
  providers: [SupabaseService], // Changed service
  standalone: true,
})
export class OrdersComponent implements OnInit {
  marginLeft = 200;
  isSidebarOpen = false;
  isDetailSidebarVisible = false;
  isEditing = false;
  selectedOrder: Order | null = null; // Changed to Order type
  originalOrder: Order | null = null;
  measurements: Measurement[] = [];
  originalMeasurements: Measurement[] = [];
  sortMeta = [
    { field: "id", order: 1 }, // Updated sort field
  ];
  orderForm: FormGroup;
  measurementFormArray: FormArray;

// Add to component class
cities = [
  { label: 'Cairo', value: 'cairo' },
  { label: 'Alexandria', value: 'alexandria' },
  // ... other cities from your reference
];

units = [
  { label: 'm²', value: 'm2' },
  { label: 'm (linear)', value: 'ml' },
  { label: 'm³', value: 'm3' }
];


constructor(
  private linkService: LinkService,
  private fb: FormBuilder,
  private supabaseService: SupabaseService,
  private cd: ChangeDetectorRef // Add ChangeDetectorRef

) {
  this.linkService.isSidebarOpen$.subscribe((value) => {
    this.isSidebarOpen = value;
  });

  this.orderForm = this.fb.group({
    customer_name: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FFa-zA-Z ]+$/)]],
    city: [null, Validators.required],
    address_details: ['', Validators.required],
    order_status: ['pending', Validators.required],
    work_types: ['', Validators.required],
    order_price: [0, [Validators.required, Validators.min(0)]],
    order_cost: [0, [Validators.required, Validators.min(0)]],
    company: [''],
    code: ['', Validators.required],
    measurements: this.fb.array([])
  });
  
  this.measurementFormArray = this.orderForm.get('measurements') as FormArray;
}


  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }
  // ► 1. Totals (getters) ---------------------------------------------
  get totalPrice(): number {
    return this.orders?.reduce((s, o) => s + (o.order_price || 0), 0) || 0;
  }
  get totalCost(): number {
    return this.orders?.reduce((s, o) => s + (o.order_cost || 0), 0) || 0;
  }


  // ► 2. Row colouring --------------------------------------------------
  rowClass = (order: Order) => {
    switch ((order.order_status || '').toLowerCase()) {
      case 'completed': return 'table-success';     // green
      case 'pending': return 'table-warning';     // yellow
      case 'cancelled': return 'table-danger';      // red
      default: return '';
    }
  };

  orders: Order[] = []; // Changed to Order array
  statuses = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" }
  ];
  loading = true;
  searchValue: string | undefined;

  async ngOnInit() {
    this.loadOrders();
 
    
  }

  async loadOrders() {
    try {
      this.orders = await this.supabaseService.retrieveDB<Order>("Orders");
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      this.loading = false;
    }
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = "";
  }

  getSeverity(status: string) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return null;
    }
  }

  async viewOrderDetails(order: Order) {
    try {
      this.selectedOrder = { ...order };
      this.isDetailSidebarVisible = true;
      this.isEditing = false;

      // Load measurements
      const measurements = await this.supabaseService.retrieveDB<Measurement>(
        'Measurements',
        { order_id: order.id }
      );
      this.measurements = measurements;
      this.measurementFormArray.clear();
      measurements.forEach(m => this.addMeasurement(m));
      this.originalMeasurements = measurements.map(m => ({ ...m }));

      // Parse address
      const addressParts = (this.selectedOrder.address || '').split(', ');
      const cityValue = addressParts.length > 0 ? addressParts[0].toLowerCase() : '';
      const city = this.cities.find(c => c.value === cityValue) || null;
      const addressDetails = addressParts.slice(1).join(', ') || '';

      // Initialize form
      this.orderForm.patchValue({
        customer_name: order.customer_name,
        city: city,
        address_details: addressDetails,
        order_status: order.order_status,
        work_types: order.work_types,
        order_price: order.order_price,
        order_cost: order.order_cost,
        company: order.company,
        code: order.code
      });

      this.orderForm.disable();
    } catch (error) {
      console.error('Error loading order details:', error);
      this.closeDetailSidebar();
    }
  }


  get statusSummary() {
    const map: Record<string, { label: string, count: number, sum: number }> = {};
    this.orders.forEach(o => {
      const key = (o.order_status || 'unknown').toLowerCase();
      if (!map[key]) map[key] = { label: key.replace('_', ' ').toUpperCase(), count: 0, sum: 0 };
      map[key].count++;
      map[key].sum += o.order_price || 0;
    });
    return Object.values(map);
  }

  get averagePrice() {
    return this.orders?.reduce((s, o) => s + (o.order_price || 0), 0) / (this.orders?.length || 1);
  }



  closeDetailSidebar() {
    this.isDetailSidebarVisible = false;
    this.isEditing = false;
    this.selectedOrder = null;
    this.originalOrder = null;
  }



// Simplified edit methods
startEditing() {
  if (!this.selectedOrder) return;

  // 1) Seed the form with the selected order’s values
  //    (split the address into city + details as you did before)
  const [cityLabel, ...addrParts] = (this.selectedOrder.address || '').split(', ');
  const addressDetails = addrParts.join(', ');

  this.orderForm.patchValue({
    customer_name:   this.selectedOrder.customer_name,
    city:            this.cities.find(c => c.value === cityLabel.toLowerCase()) || null,
    address_details: addressDetails,
    order_status:    this.selectedOrder.order_status,
    work_types:      this.selectedOrder.work_types,
    order_price:     this.selectedOrder.order_price,
    order_cost:      this.selectedOrder.order_cost,
    company:         this.selectedOrder.company,
    code:            this.selectedOrder.code
  });

  // 2) Turn on edit mode and enable the form
  this.isEditing = true;
  this.orderForm.enable();
  this.cd.detectChanges();
}


cancelEditing() {
  this.isEditing = false;
  this.orderForm.disable();
  this.selectedOrder = this.originalOrder ? {...this.originalOrder} : null;
  this.cd.detectChanges();
}

 



createMeasurement(measurement?: Measurement): FormGroup {
  return this.fb.group({
    id: [measurement?.id || null],
    material_type: [measurement?.material_type || '', Validators.required],
    material_name: [measurement?.material_name || '', Validators.required], // Add this line
    unit: [measurement?.unit || 'm2', Validators.required],
    quantity: [measurement?.quantity || 1, [Validators.required, Validators.min(1)]],
    cost: [measurement?.cost || 0, [Validators.required, Validators.min(0)]],
    total_cost: [measurement?.total_cost || 0]
  });
}
  addMeasurement(measurement?: Measurement) {
    this.measurementFormArray.push(this.createMeasurement(measurement));
  }

  removeMeasurement(index: number) {
    this.measurementFormArray.removeAt(index);
  }
 
  
  
  private async handleMeasurementsUpdate() {
    const currentMeasurements = this.measurementFormArray.value;
    const originalIds = this.originalMeasurements.map(m => m.id);
    const currentIds = currentMeasurements.map((m: Measurement) => m.id).filter(Boolean);

    // Delete removed measurements
    const deletedIds = originalIds.filter(id => !currentIds.includes(id));
    await Promise.all(deletedIds.map(id =>
      this.supabaseService.deleteDB('Measurements', { id })
    ));

    // Update/Create measurements
    await Promise.all(currentMeasurements.map((m: Measurement) => {
      const measurementData = {
        ...m,
        order_id: this.selectedOrder!.id,
        total_cost: m.quantity * m.cost
      };

      return m.id ?
        this.supabaseService.updateDB('Measurements', m.id, measurementData) :
        this.supabaseService.insertToDB('Measurements', measurementData);
    }));
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

 








  /** Called when the user clicks the green “Save” button */
onSaveEdit() {
  if (this.orderForm.invalid) {
    this.markFormGroupTouched(this.orderForm);
    return;
  }
  const v = this.orderForm.value;
  // merge the edited values back into selectedOrder for the UI
  if (this.selectedOrder) {
    this.selectedOrder = {
      ...this.selectedOrder,
      customer_name:    v.customer_name,
      address:          `${v.city.value}, ${v.address_details}`,
      order_status:     v.order_status,
      work_types:       v.work_types,
      company:          v.company,
      code:             v.code,
      order_price:      v.order_price,
      order_cost:       v.order_cost
    };
  }
  this.isEditing = false;
  this.orderForm.disable();
}

/** Called when the user clicks the cancel (X) button in edit mode */
onCancelEdit() {
  this.isEditing = false;
  this.orderForm.disable();
}

}


