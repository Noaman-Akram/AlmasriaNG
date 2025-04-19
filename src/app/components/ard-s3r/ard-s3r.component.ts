import { Component, OnInit, Injector, ViewChild, TemplateRef } from '@angular/core';
import { LinkService } from '../../link.service';
import { NgbDatepickerModule, NgbAlertModule, NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { JsonPipe, CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Customer, Order, SupabaseService } from '../../services/supabase.service';


function numberOnlyValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null; // Allow empty values (handled by required validator if needed)
  }
  const isValid = !isNaN(value) && /^[0-9]*$/.test(value.toString());
  return isValid ? null : { numberOnly: true };
}

interface WorkType {
  name: string;
  code: string;
}
// Interface for recent orders
interface RecentOrder {
  id?: number;
  customer_name?: string;
  work_types?: string;
  order_status?: string; // Corrected from potential typo
  created_at?: string;
}


@Component({
  selector: 'app-ard-s3r',
  standalone: true,
  imports: [
    ReactiveFormsModule,   // REQUIRED for reactive forms
    NgbDatepickerModule,
    NgbAlertModule,
    NgbModalModule,        // For modal functionality
    CommonModule,
    JsonPipe,
    MultiSelectModule,
    SelectModule
  ],
  templateUrl: './ard-s3r.component.html',
  styleUrls: ['./ard-s3r.component.css']
})
export class ArdS3rComponent implements OnInit {
  private supabaseService: SupabaseService;
  orderForm: FormGroup;
  nextId: number = 0;
  finalOrderCode: string = '';
  today: Date = new Date();
  marginLeft = 200;
  isSidebarOpen = false;
  submitMessage: string = '';
  isSubmitting: boolean = false;

  selectedFile: File | null = null;

  recentOrders: RecentOrder[] = [];
isLoadingOrders: boolean = false;

// Add this method to the component class
async loadRecentOrders() {
  this.isLoadingOrders = true;
  try {
    // Fetch the last 5 records based on the primary key, assuming 'id' is auto-incremented
    const orders = await this.supabaseService.retrieveDB('Orders', {}, 5, "id",false );  // Default is by 'id' (auto-incremented), no need for `created_at`

    // Set the fetched orders into the component
    this.recentOrders = orders as RecentOrder[];
  } catch (err) {
    console.error('Error loading recent orders:', err);
  } finally {
    this.isLoadingOrders = false;
  }
}




// Helper method to format work types
formatWorkTypes(workTypesInput: any): string {
  if (!workTypesInput) {
    return '';
  }
  // If it's a string, remove braces
  if (typeof workTypesInput === 'string') {
    return workTypesInput.replace(/{|}/g, '');
  }
  // If it's an array, join its elements with commas (or format as needed)
  if (Array.isArray(workTypesInput)) {
    return workTypesInput.join(', ');
  }
  // Otherwise, convert it to string
  return workTypesInput.toString();
}

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

  workTypes: WorkType[] = [
    { name: 'Kitchen', code: 'K' },
    { name: 'Walls', code: 'W' },
    { name: 'Floor', code: 'F' },
    { name: 'Other', code: 'X' }
  ];

  @ViewChild('successModal') successModal!: TemplateRef<any>;
  private modalRef!: NgbModalRef;
  
  fillTestData(): void {
    this.orderForm.patchValue({
      existingCustomer: false,
      customerName: 'Test Customer',
      phoneNumber: '01000000000',
      city: this.cities.find(c => c.value === 'cairo'),
      addressDetails: '123 Test Street',
      workType: [
        { name: 'Kitchen', code: 'K' },
        { name: 'Walls', code: 'W' }
      ],
      hasCompany: false,
      companyName: '',
    });
  
    // For order items, either clear existing items or add them
    while (this.orderItemsArray.length) {
      this.orderItemsArray.removeAt(0);
    }
    this.addOrderItem(); // add 1 row
    this.orderItemsArray.at(0).patchValue({
      marbleMaterial: 'Marble',
      dimension: 'm2',
      amount: 2,
      cost: 300
    });
  }


  constructor(
    private fb: FormBuilder,
    private linkService: LinkService,
    private injector: Injector,
    private modalService: NgbModal
  ) {
    this.supabaseService = this.injector.get(SupabaseService);
  
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      addressDetails: ['', Validators.required],
      workType: this.fb.control([], Validators.required),
      orderItems: this.fb.array([]),
      existingCustomer: [false],
      customerId: [null],
      hasCompany: [false],
      companyName: [''],
      ExtraEstimatedCost: [null, [numberOnlyValidator]], // Remove Validators.required
      TotalPrice: ['', [Validators.required, numberOnlyValidator]],
    });
  
    this.linkService.isSidebarOpen$.subscribe(value => {
      this.isSidebarOpen = value;
    });
  
    this.addOrderItem(); // Start with one row
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  openSuccessModal() {
    this.modalRef = this.modalService.open(this.successModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
  }

  customersList: any[] = []; // or type Customer[] if you have an interface

  async ngOnInit() {
    const lastId = await this.supabaseService.getLastOrderId();
    this.nextId = lastId + 1;
    this.orderForm.get('workType')?.valueChanges.subscribe(() => {
      this.updateOrderId();
    });
    this.updateOrderId();
 


    this.supabaseService.retrieveDB('Customers')
    .then((customers) => {
      this.customersList = customers;
    })
    .catch(err => console.error('Error retrieving customers:', err));


    this.setupCheckboxListeners();
    this.loadRecentOrders();

  }

  printOrder() {
    window.print();
  }
  private setupCheckboxListeners(): void {
    // existingCustomer checkbox
    this.orderForm.get('existingCustomer')?.valueChanges.subscribe((checked: boolean) => {
      const customerNameControl = this.orderForm.get('customerName');
      const customerIdControl = this.orderForm.get('customerId');
  
      if (checked) {
        // Disable the text input for name, reset it
       // customerNameControl?.disable();
        customerNameControl?.reset();
  
        // Make the dropdown required
        customerIdControl?.setValidators([Validators.required]);
        
        
        
      } else {
        // Re-enable the text input
        customerNameControl?.enable();
  
        // Clear validators for the dropdown
        customerIdControl?.clearValidators();
        customerIdControl?.reset();
      }
      customerNameControl?.updateValueAndValidity();
      customerIdControl?.updateValueAndValidity();
    });
    this.orderForm.get('customerId')?.valueChanges.subscribe((selectedId: number) => {
      if (selectedId) {
        const customer = this.customersList.find(c => c.id === selectedId);
        if (customer) {
          // Auto-fill the phone number.
          this.orderForm.patchValue({
            phoneNumber: customer.phone_number,
            customerName: customer.name 
          });
          // Assume customer.address is in the format "City, Address Details".
          if (customer.address) {
            const addressParts = customer.address.split(', ');
            const cityName = addressParts[0];
            const cityObj = this.cities.find(c => c.label.toLowerCase() === cityName.toLowerCase());
            this.orderForm.patchValue({
              city: cityObj || null,
              addressDetails: addressParts.slice(1).join(', ')
            });
          }
        }
      } else {
        // Optionally, clear the auto-filled fields if no customer is selected.
        this.orderForm.patchValue({
          phoneNumber: '',
          city: '',
          addressDetails: ''
        });
      }
    });
  
  
    // hasCompany checkbox
    this.orderForm.get('hasCompany')?.valueChanges.subscribe((checked: boolean) => {
      const companyNameControl = this.orderForm.get('companyName');
  
      if (checked) {
        // Make companyName required
        companyNameControl?.setValidators([Validators.required]);
      } else {
        // Clear it out
        companyNameControl?.clearValidators();
        companyNameControl?.reset();
      }
      companyNameControl?.updateValueAndValidity();
    });
  }
  

  get orderItemsArray(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  updateOrderId() {
    const selectedWorkTypes = this.orderForm.get('workType')?.value || [];
    const combinedCodes = selectedWorkTypes.map((wt: WorkType) => wt.code).join('');
    this.finalOrderCode = combinedCodes ? `${combinedCodes}-${this.nextId}` : `-${this.nextId}`;
  }

  updateMargin(): number {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }
  
  addOrderItem() {
    const orderItemGroup = this.fb.group({
      MaterialType: ['', Validators.required], // Radio button, required
      MaterialName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]], // Text only, required
      dimension: ['', Validators.required], // Dropdown, required
      amount: [null, [Validators.required, Validators.min(1)]], // Positive number, required
      cost: [null, [Validators.required, Validators.min(0)]], // Non-negative number, required
    });
    this.orderItemsArray.push(orderItemGroup);
  }

  removeOrderItem(index: number) {
    if (this.orderItemsArray.length > 1) {
      this.orderItemsArray.removeAt(index);
    }
  }

  calculateTotal(index: number): number {
    const item = this.orderItemsArray.at(index);
    const amount = item.get('amount')?.value || 0;
    const cost = item.get('cost')?.value || 0;
    return amount * cost;
  }

  get grandTotal(): number {
    return this.orderItemsArray.controls.reduce((sum, control) => {
      const amount = control.get('amount')?.value || 0;
      const cost = control.get('cost')?.value || 0;
      return sum + (amount * cost);
    }, 0);
  }

  async submitOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.submitMessage = 'Please fill in all required fields correctly.';
      return;
    }
  
    this.isSubmitting = true;
    const formValue = this.orderForm.value;
    const grandTotal = this.grandTotal;
    let customerId: number | null = null;
  
    try {
      // 1. Handle new customer insertion if needed
      if (!formValue.existingCustomer) {
        const customer: Customer = {  
          name: formValue.customerName,
          phone_number: formValue.phoneNumber,
          address: `${formValue.city.value}, ${formValue.addressDetails}`,
          company: formValue.hasCompany ? formValue.companyName : null,
          paid_total: 0,
          to_be_paid: grandTotal,
          created_at: new Date().toISOString()
        };
  
        const insertedCustomer = await this.supabaseService.insertToDB('Customers', customer);
  
        if (insertedCustomer?.id) {
          customerId = insertedCustomer.id; // Get the auto-generated ID
        } else {
          throw new Error('Failed to insert customer');
        }
      } else {
        customerId = formValue.customerId; // Use existing customer ID
      }
  
      // 2. Create the order
      const newOrder: Order = {
        customer_name: formValue.customerName,
        customer_id: customerId,
        company: formValue.hasCompany ? formValue.companyName : null,
        work_types: `{${formValue.workType.map((wt: WorkType) => wt.code).join(',')}}`,
        address: `${formValue.city.value}, ${formValue.addressDetails}`,
        order_status: 'pending',
        order_price: grandTotal,
        order_cost: grandTotal,
        created_by: 'admin',
        code: this.finalOrderCode
      };
  
      const insertedOrder = await this.supabaseService.insertToDB('Orders', newOrder);
      if (!insertedOrder?.id) {
        throw new Error('Failed to insert order');
      }
  
      // 3. Insert order items (measurements)
      const orderItems = formValue.orderItems.map((item: any) => ({
        order_id: insertedOrder.id, // Link the measurement to the order
        marbleMaterial: item.marbleMaterial,
        dimension: item.dimension,
        amount: item.amount,
        cost: item.cost,
        total: item.amount * item.cost
      }));
  
      const measurementInsertion = await this.supabaseService.insertToDB('Measurements', orderItems);
      if (!measurementInsertion) {
        throw new Error('Failed to insert measurements');
      }
  
      // 4. Success
      this.submitMessage = 'Order submitted successfully!';
      console.log('Inserted Order:', insertedOrder);
  
      // Reset the form after successful submission
      this.orderForm.reset();
      this.orderItemsArray.clear();
      this.addOrderItem();
      this.nextId++;
      this.updateOrderId();
  
      setTimeout(() => {
        this.openSuccessModal();
      }, 100);
  
    } catch (err: unknown) {
       // Check if the error is an instance of Error
  if (err instanceof Error) {
    // Log the exact error message to console
    console.error('Error occurred:', err);

    // Propagate exact error message to the UI
    this.submitMessage = err.message || 'Something went wrong, please try again.';
  } else {
    // If it's not an instance of Error, just log a generic message
    console.error('Unknown error occurred:', err);

    this.submitMessage = 'Something went wrong, please try again.';
  }
    } finally {
      this.isSubmitting = false;
    }
  }
  
}

