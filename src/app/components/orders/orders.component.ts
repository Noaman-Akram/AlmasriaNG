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
  workTypes = [
    { name: 'Kitchen', code: 'K' },
    { name: 'Walls', code: 'W' },
    { name: 'Floor', code: 'F' },
    { name: 'Other', code: 'X' }
  ];
  
// Add to component class
cities = [
  { label: 'Cairo', value: 'cairo' },
  { label: 'Alexandria', value: 'alexandria' },
  { label: 'Giza', value: 'giza' },
  { label: 'Luxor', value: 'luxor' },
  { label: 'Aswan', value: 'aswan' },
  { label: 'Sharm El Sheikh', value: 'sharm-el-sheikh' },
  { label: 'Hurghada', value: 'hurghada' },
  { label: 'Mansoura', value: 'mansoura' },
  { label: 'Tanta', value: 'tanta' },
  { label: 'Port Said', value: 'port-said' },
  { label: 'Suez', value: 'suez' },
  { label: 'Ismailia', value: 'ismailia' },
  { label: 'Fayoum', value: 'fayoum' },
  { label: 'Minya', value: 'minya' },
  { label: 'Assiut', value: 'assiut' },
  { label: 'Sohag', value: 'sohag' },
  { label: 'Qena', value: 'qena' },
  { label: 'Beni Suef', value: 'beni-suef' },
  { label: 'Damanhur', value: 'damanhur' },
  { label: 'Zagazig', value: 'zagazig' },
  { label: 'Damietta', value: 'damietta' },
  { label: 'Arish', value: 'arish' },
  { label: 'Other', value: 'other' }
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
// ➤ Inside the constructor where you define the form:
this.orderForm = this.fb.group({
  customer_name: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FFa-zA-Z ]+$/)]],
  city: [null, Validators.required],
  address_details: ['', Validators.required],
  order_status: ['pending', Validators.required],
work_types: [[], Validators.required],
  order_price: [0, [Validators.required, Validators.min(0)]],
  order_cost: [0, [Validators.required, Validators.min(0)]],
  company: [''],
  hasCompany: [false], // <<< ADD THIS LINE
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
  saveMessage: string = '';

  async ngOnInit() {
    this.loadOrders();

    this.orderForm.get('code')?.disable();
    this.orderForm.get('order_status')?.disable();
  
    // Setup company toggle
    this.orderForm.get('hasCompany')?.valueChanges.subscribe((checked: boolean) => {
      const companyControl = this.orderForm.get('company');
  
      if (checked) {
        companyControl?.enable();
      } else {
        companyControl?.disable();
        companyControl?.setValue('');
      }
    });
  
    // Initially, company input should be disabled if checkbox not checked
    if (!this.orderForm.get('hasCompany')?.value) {
      this.orderForm.get('company')?.disable();
    }
  
    
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
      const measurements = await this.supabaseService.retrieveDB<Measurement>('Measurements', { order_id: order.id });
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
        city: city, // 👈 pass full city object, not string
        address_details: addressDetails,
        order_status: order.order_status,
        work_types: this.mapWorkTypesToObjects(
          typeof this.selectedOrder.work_types === 'string'
            ? this.selectedOrder.work_types.replace(/[{}]/g, '').split(',')
            : this.selectedOrder.work_types
        ),
        order_price: order.order_price,
        order_cost: order.order_cost,
        company: order.company,
        hasCompany: !!order.company, // 👈 Important if you want hasCompany correct when viewing
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
  
  
  private mapWorkTypesToObjects(codes: string[]): { name: string; code: string }[] {
    return this.workTypes.filter(work => codes.includes(work.code));
  }
  
  private mapWorkTypesToCodes(objects: { name: string; code: string }[]): string[] {
    return objects.map(work => work.code);
  }
  
  
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  
  
  
  // Simplified edit methods
  startEditing() {
    if (!this.selectedOrder) return;
  
    const [cityPart, ...addressParts] = (this.selectedOrder.address || '').split(', ');
    const addressDetails = addressParts.join(', ');
    const cityObj = this.cities.find(c => c.value.toLowerCase() === cityPart.toLowerCase()) || null;
  
    this.orderForm.patchValue({
      customer_name: this.selectedOrder.customer_name || '',
      city: cityObj, // 👈 Corrected
      address_details: addressDetails || '',
      order_status: this.selectedOrder.order_status || '',
      work_types: this.mapWorkTypesToObjects(
        typeof this.selectedOrder.work_types === 'string'
          ? this.selectedOrder.work_types.replace(/[{}]/g, '').split(',')
          : this.selectedOrder.work_types
      ),
      order_price: this.selectedOrder.order_price || 0,
      order_cost: this.selectedOrder.order_cost || 0,
      company: this.selectedOrder.company || '',
      hasCompany: !!this.selectedOrder.company, // 👈 Set hasCompany true/false
      code: this.selectedOrder.code || ''
    });
  
    this.isEditing = true;
    this.orderForm.enable();
    this.orderForm.get('code')?.disable();
    this.orderForm.get('order_status')?.disable();
  
    // Debug: auto-update code when work_types change
    this.orderForm.get('work_types')?.valueChanges.subscribe(selected => {
      console.group('Order Edit Debug');
      console.debug('Selected Work Types:', selected);
      const codes = selected.map((w: any) => w.code);
      console.debug('Codes:', codes);
      const newCode = `${codes.join('')}-${this.selectedOrder?.id}`;
      console.debug('Updating code:', newCode);
      this.orderForm.get('code')?.setValue(newCode, { emitEvent: false });
      console.groupEnd();
    });
  }
  
  
  async onSaveEdit() {
    console.group('onSaveEdit');
    const raw = this.orderForm.getRawValue();
    console.debug('Form rawValue:', raw);

    const v = raw;

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    // Combine city + address_details into a single address string
    const fullAddress = v.city.value + ', ' + v.address_details;
    console.debug('fullAddress:', fullAddress);

    if (this.selectedOrder?.id) {
      const updateOrderData: Partial<Order> = {
        customer_name: v.customer_name,
        address: fullAddress,
        order_status: v.order_status,
        work_types: `{${this.mapWorkTypesToCodes(v.work_types).join(',')}}`,
        order_price: v.order_price,
        order_cost: v.order_cost,
        company: v.hasCompany ? v.company : null,
        code: v.code
      };
      console.debug('updateOrderData:', updateOrderData);
      try {
        const result = await this.supabaseService.updateDB<Order>('Orders', this.selectedOrder.id, updateOrderData);
        console.debug('Update result:', result);
        if (result) {
          this.selectedOrder = result;
          this.orderForm.get('code')?.setValue(result.code, { emitEvent: false });
          this.cd.detectChanges();
          this.saveMessage = 'Order updated successfully';
          setTimeout(() => (this.saveMessage = ''), 3000);
        }
        // Handle measurements
        const currentMeasurements = (this.measurementFormArray.controls as FormGroup[]).map(ctrl => ({
          id: ctrl.get('id')?.value as number,
          material_type: ctrl.get('material_type')?.value,
          material_name: ctrl.get('material_name')?.value,
          unit: ctrl.get('unit')?.value,
          quantity: ctrl.get('quantity')?.value,
          cost: ctrl.get('cost')?.value,
          total_cost: (ctrl.get('quantity')?.value || 0) * (ctrl.get('cost')?.value || 0)
        }));
        console.group('Measurements Debug');
        console.debug('CurrentMeasurements:', currentMeasurements);
        console.groupEnd();
        for (const m of currentMeasurements) {
          if (m.id) {
            await this.supabaseService.updateDB<Measurement>('Measurements', m.id, {
              material_type: m.material_type,
              material_name: m.material_name,
              unit: m.unit,
              quantity: m.quantity,
              cost: m.cost,
              total_cost: m.total_cost
            });
          } else {
            await this.supabaseService.insertToDB<Measurement>('Measurements', { ...m, order_id: this.selectedOrder!.id! });
          }
        }
        const originalIds = this.originalMeasurements.map(m => m.id).filter(id => id != null) as number[];
        const currentIds = currentMeasurements.map(m => m.id).filter(id => id != null) as number[];
        for (const id of originalIds.filter(id => !currentIds.includes(id))) {
          await this.supabaseService.deleteDB<Measurement>('Measurements', { id });
        }
        this.loadOrders();
      } catch (err) {
        console.error('Error saving edits details:', err);
      }
    }
    console.groupEnd();
    this.isEditing = false;
    this.orderForm.disable();
  }
  
  onCancelEdit() {
    this.isEditing = false;
    this.orderForm.disable();
  }
    
  
  
  

 
 

  // Helper to compute subtotal of measurements
  getMeasurementsSubTotal(): number {
    return this.measurementFormArray.controls.reduce((sum, ctrl) => {
      const qty = ctrl.get('quantity')?.value || 0;
      const cost = ctrl.get('cost')?.value || 0;
      return sum + qty * cost;
    }, 0);
  }

}
