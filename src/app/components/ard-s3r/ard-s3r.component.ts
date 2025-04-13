import { Component, OnInit, Injector, ViewChild, TemplateRef } from '@angular/core';
import { LinkService } from '../../link.service';
import { NgbDatepickerModule, NgbAlertModule, NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { JsonPipe, CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Customer, SupabaseService } from '../../services/supabase.service';
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
    const orders = await this.supabaseService.retrieveDB('Orders', {
      limit: 5
    });
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
    private modalService: NgbModal // inject NgbModal service
  ) {
    this.supabaseService = this.injector.get(SupabaseService);

    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      city: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      addressDetails: ['', Validators.required],
      workType: this.fb.control([], Validators.required),
      orderItems: this.fb.array([]),
      existingCustomer: [false],    // checkbox
      customerId: [null],          // dropdown if existing customer
      hasCompany: [false],         // checkbox
      companyName: ['']            // input if hasCompany is true
    });

    this.linkService.isSidebarOpen$.subscribe(value => {
      this.isSidebarOpen = value;
    });

    this.addOrderItem(); // Start with one row
    
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
      marbleMaterial: ['', Validators.required],
      dimension: ['',Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      cost: [null, [Validators.required, Validators.min(0)]]
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

    // Wait for the insert to complete and get the inserted customer
    const insertedCustomer = await this.supabaseService.insertToDB('Customers', customer);
    
    if (insertedCustomer?.id) {
      customerId = insertedCustomer.id; // Get the auto-generated ID
    } else {
      console.error('Failed to insert customer');
      return; // Exit if customer creation failed
    }
  } else {
    customerId = formValue.customerId; // Use existing customer ID
  }

    
    const newOrder = {
     // order_id: '',
   //   customer_id: formValue.existingCustomer ? formValue.customerId : null,
      customer_name: formValue.customerName,
      phone_number: formValue.phoneNumber,
      customer_id: customerId,
      
      work_types: `{${formValue.workType.map((wt: WorkType) => wt.code).join(',')}}`,
      address: `${formValue.city.value}, ${formValue.addressDetails}`,
      order_status: 'pending'
    };
  
    const orderItems = formValue.orderItems.map((item: any) => ({
      marbleMaterial: item.marbleMaterial,
      dimension: item.dimension,
      amount: item.amount,
      cost: item.cost,
      total: item.amount * item.cost
    }));
  
    this.supabaseService.insertToDB('Orders', newOrder)
      .then((result) => {
        if(result) {
          this.submitMessage = 'Order submitted successfully!';
          console.log("Inserted Order:", result);
        }
        else {
          this.submitMessage = 'Order submission failed: No order ID returned';
        }
        // Instead of storing, just use newOrder and orderItems directly in the template
       // this.orderForm.reset();
       // this.orderItemsArray.clear();
        //this.addOrderItem();
        this.nextId++;
       this.updateOrderId();
      })
      .catch(err => {
        this.submitMessage = 'Error submitting order: ' + err.message;
        console.log("Error submitting order:", err);

      })
      .finally(() => {
        this.isSubmitting = false;
        setTimeout(() => {
          this.openSuccessModal();
        }, 100);
      });
  }
}

/*
newOrder = {
    order_id: '',
    customer_id: null,
    customer_name: '',
    work_types: '',
    address: '',
    order_status: 'pending'
  }
  addTestOrder(){
    this.supabaseService.insertToDB('Orders', this.newOrder) 
    .then(order => console.log("Inserted Order:", order))
  .catch(err => console.error(err));
  }

  addNewOrder(){
    this.supabaseService.insertToDB('Customers', this.newOrder) 

  }
  submitOrder() {
    if (this.orderForm.valid) {
      console.log('Final Order:', this.orderForm.value);
    } else {
      console.log('Form is invalid');
    }
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