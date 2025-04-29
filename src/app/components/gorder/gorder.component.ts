import { Component, OnInit, Injector } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, JsonPipe } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SupabaseService } from '../../services/supabase.service'; // adjust the path as needed

interface WorkType {
  name: string;
  code: string;
}

interface Measurement {
  order_id:     number;
  material_name: string; // or material_type if that’s what you store
  unit:         string;
  quantity:     number;
  cost:         number;
}

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbAlertModule,
    CommonModule,
    JsonPipe,
    MultiSelectModule,
    SelectModule,
  ],
  templateUrl: './gorder.component.html',
  styleUrls: ['./gorder.component.css']
})
export class GorderComponent implements OnInit {
  orderForm: FormGroup;
  ordersList: any[] = [];
  selectedOrder: any = null;
  supabaseService: SupabaseService;
  isSubmitting = false;
  submitMessage = '';
  today: Date = new Date();
  marginLeft = 200;
  isSidebarOpen = false;

  finalOrderCode: string = '';


  // For file (attachment) handling
  selectedFile: File | null = null;

  // Example arrays for dropdowns (customize as needed)
  cities = [
    { label: 'Cairo', value: 'cairo' },
    { label: 'Alexandria', value: 'alexandria' },
    { label: 'Giza', value: 'giza' },
    { label: 'Other', value: 'other' }
  ];

  workTypes: WorkType[] = [
    { name: 'Kitchen', code: 'K' },
    { name: 'Walls', code: 'W' },
    { name: 'Floor', code: 'F' },
    { name: 'Other', code: 'X' }
  ];

  constructor(
    private fb: FormBuilder,
    private injector: Injector
  ) {
    // Get the SupabaseService from the injector.
    this.supabaseService = this.injector.get(SupabaseService);

    // Create the form group with the original controls plus extra ones.
    this.orderForm = this.fb.group({
      // Order/Customer Details
      customerName: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      addressDetails: ['', Validators.required],
      workType: [[], Validators.required],
      // Order Items array
      orderItems: this.fb.array([]),
      // Company Info
      hasCompany: [false],
      companyName: [''],

      // New fields for editing the order
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      attachment: [null] // to store the file name or URL
    });
    this.orderForm.addControl('orderDetails', this.fb.array([]));
    this.orderForm.addControl('measurements',  this.fb.array([]));
    this.orderForm.addControl('transactions',  this.fb.array([]));
    this.orderForm.addControl('orderStages',   this.fb.array([]));

    // Start with one empty order item.
    this.addOrderItem();
  }

  ngOnInit(): void {
    // First, fetch the orders from the database.
    this.fetchOrders();

    // Setup the watcher for the "hasCompany" checkbox.
    this.setupCheckboxListeners();
  }

  /**
   * Fetch orders from database.
   */
  fetchOrders(): void {
    this.supabaseService.retrieveDB('Orders')
      .then((orders) => {
        this.ordersList = orders;
      })
      .catch(err => console.error('Error retrieving orders:', err));
  }
  loadRecentOrders(): void {
    this.fetchOrders();
  }
  isLoadingOrders: boolean = false;
  /**
   * Called when an order is selected from the dropdown.
   * It finds the order by its id and patches the form with its data.
   
  onOrderSelect(orderId: number): void {
    const order = this.ordersList.find(o => o.id == orderId);
    if (order) {
      this.selectedOrder = order;
      // Assume order.address is in the format "city, address details"
      let city = '';
      let addressDetails = '';
      if (order.address) {
        const parts = order.address.split(', ');
        city = parts[0];
        addressDetails = parts.slice(1).join(', ');
      }
      // Patch values into the form.
      this.orderForm.patchValue({
        customerName: order.customer_name,
        phoneNumber: order.phone_number,
        city: this.cities.find(c => c.value === city) || '',
        addressDetails: addressDetails,
        workType: this.parseWorkTypes(order.work_types),
        hasCompany: order.company ? true : false,
        companyName: order.company || '',
        startDate: order.start_date || '',
        endDate: order.end_date || '',
        attachment: order.attachment || null
      });
      
      // If order has order items, set them into the FormArray.
      if (order.orderItems && Array.isArray(order.orderItems)) {
        this.setOrderItems(order.orderItems);
      }
    }
  }
*/
onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    this.selectedFile = null;
    return;
  }

  this.selectedFile = input.files[0];
  // if you want to store the filename/URL in the form control:
  this.orderForm.patchValue({
    attachment: this.selectedFile.name
  });

  // optionally mark the control as dirty/touched
  this.orderForm.get('attachment')?.markAsDirty();
}




async onOrderSelect(orderIdStr: string): Promise<void> {
  const id = Number(orderIdStr);
  if (!id) return;

  // 1️⃣ find the order
  const order = this.ordersList.find(o => o.id === id);
  if (!order) return;
  this.selectedOrder = order;

  // 2️⃣ patch simple scalar fields
  const [ city, ...rest ] = (order.address || '').split(', ');
  this.orderForm.patchValue({
    customerName:   order.customer_name,
    phoneNumber:    order.phone_number,
    city:           this.cities.find(c => c.value === city) || '',
    addressDetails: rest.join(', '),
    workType:       this.parseWorkTypes(order.work_types),
    hasCompany:     !!order.company,
    companyName:    order.company || '',
    startDate:      order.start_date,
    endDate:        order.end_date,
    attachment:     order.attachment
  });

  // 3️⃣ load Measurements & filter for this order
  try {
    const allMeasurements = await this
      .supabaseService
      .retrieveDB('Measurements') as Measurement[];

    const myMeasurements = allMeasurements
      .filter(m => m.order_id === id);

    // 4️⃣ map into your FormArray
    this.setOrderItems(
      myMeasurements.map(m => ({
        marbleMaterial: m.material_name,
        dimension:      m.unit,
        amount:         m.quantity,
        cost:           m.cost
      }))
    );

  } catch (err) {
    console.error('Error loading measurements:', err);
  }
}

  /**
   * Parses the stored work_types string into an array of WorkType objects.
   * Expected format example: "{K,W}"
   */
  parseWorkTypes(workTypesInput: any): WorkType[] {
    if (!workTypesInput) {
      return [];
    }
  
    // If already an array, assume it contains the codes directly
    if (Array.isArray(workTypesInput)) {
      return this.workTypes.filter(wt => workTypesInput.includes(wt.code));
    }
    
    // If it's a string, remove braces and split
    if (typeof workTypesInput === 'string') {
      const codes = workTypesInput.replace(/{|}/g, '').split(',');
      return this.workTypes.filter(wt => codes.includes(wt.code));
    }
  
    // Fallback: return empty array if the format is unrecognized.
    return [];
  }
  

  // Helper to access the orderItems FormArray.
  get orderItemsArray(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  /**
   * Creates a FormGroup representing a single order item.
   */
  createOrderItem(): FormGroup {
    return this.fb.group({
      marbleMaterial: ['', Validators.required],
      dimension: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      cost: [null, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Adds a new order item to the FormArray.
   */
  addOrderItem(): void {
    this.orderItemsArray.push(this.createOrderItem());
  }

  /**
   * Removes an order item from the FormArray.
   */
  removeOrderItem(index: number): void {
    if (this.orderItemsArray.length > 1) {
      this.orderItemsArray.removeAt(index);
    }
  }

  /**
   * Replaces the orderItems FormArray with the data from the selected order.
   */
  setOrderItems(items: any[]): void {
    // Clear current order items.
    while (this.orderItemsArray.length) {
      this.orderItemsArray.removeAt(0);
    }
    // Add each order item.
    items.forEach(item => {
      const group = this.fb.group({
        marbleMaterial: [item.marbleMaterial, Validators.required],
        dimension: [item.dimension, Validators.required],
        amount: [item.amount, [Validators.required, Validators.min(1)]],
        cost: [item.cost, [Validators.required, Validators.min(0)]]
      });
      this.orderItemsArray.push(group);
    });
  }

  /**
   * Computes the total cost of an order item.
   * Explicitly converts values to numbers.
   */
  calculateTotal(index: number): number {
    const item = this.orderItemsArray.at(index);
    const amount = +item.get('amount')?.value || 0;
    const cost = +item.get('cost')?.value || 0;
    return amount * cost;
  }

  /**
   * Computes the grand total cost from all order items.
   */
  get grandTotal(): number {
    return this.orderItemsArray.controls.reduce((sum, control) => {
      const amount = +control.get('amount')?.value || 0;
      const cost = +control.get('cost')?.value || 0;
      return sum + (amount * cost);
    }, 0);
  }
  get measurementsArray() { return this.orderForm.get('measurements') as FormArray; }
get orderDetailsArray() { return this.orderForm.get('orderDetails') as FormArray; }
get transactionsArray() { return this.orderForm.get('transactions') as FormArray; }

  /**
   * Handles file input changes.

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.selectedFile = event.target.files[0];
      // Here you can decide to upload immediately,
      // or simply store the file name for later processing.
      this.orderForm.patchValue({
        attachment: this.selectedFile.name
      });
    }
  }
   */
  /**
   * Sets up the watcher for the "hasCompany" checkbox.
   * If checked, the company name becomes required.
   */
  setupCheckboxListeners(): void {
    this.orderForm.get('hasCompany')?.valueChanges.subscribe((checked: boolean) => {
      const companyNameControl = this.orderForm.get('companyName');
      if (checked) {
        companyNameControl?.setValidators([Validators.required]);
      } else {
        companyNameControl?.clearValidators();
        companyNameControl?.reset();
      }
      companyNameControl?.updateValueAndValidity();
    });
  }

  /**
   * Handler for form submission.
   * This method would update the selected order in the database.
   */
  submitOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.submitMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    const formValue = this.orderForm.value;

    const updatedOrder = {
      customer_name: formValue.customerName,
      phone_number: formValue.phoneNumber,
      work_types: `{${formValue.workType.map((wt: WorkType) => wt.code).join(',')}}`,
      address: `${formValue.city.value || formValue.city}, ${formValue.addressDetails}`,
      order_status: 'updated', // Adjust status as needed
      start_date: formValue.startDate,
      end_date: formValue.endDate,
      attachment: formValue.attachment,
      grand_total: this.grandTotal
      // Add other fields as needed.
    };

    // Process order items
    const orderItems = formValue.orderItems.map((item: any) => ({
      marbleMaterial: item.marbleMaterial,
      dimension: item.dimension,
      amount: item.amount,
      cost: item.cost,
      total: item.amount * item.cost
    }));

    // Example: Update order in database.
    // Uncomment and adjust according to your service implementation.
    /*
    this.supabaseService.updateDB('Orders', this.selectedOrder.id, updatedOrder)
      .then(result => {
        this.submitMessage = 'Order updated successfully!';
        console.log("Updated Order:", result);
      })
      .catch(err => {
        this.submitMessage = 'Error updating order: ' + err.message;
        console.error("Error updating order:", err);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
    */
  }

  /**
   * Clears the current selection and resets the form
   * so you can create a new order from scratch.
   */
  createNewOrder(): void {
    this.selectedOrder = null;
    this.orderForm.reset();

    // Reset fields to their initial state.
    while (this.orderItemsArray.length) {
      this.orderItemsArray.removeAt(0);
    }
    this.addOrderItem();
  }

  /**
   * For layout adjustments.
   */
  updateMargin(): number {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }
}
