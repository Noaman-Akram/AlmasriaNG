import { Component, type OnInit } from "@angular/core"
import { LinkService } from "../../link.service"
import type { Table } from "primeng/table"
import type { Customer, Representative } from "../../customer"
import { CustomerService } from "../../customer.service"
import { TableModule } from "primeng/table"
import { CommonModule } from "@angular/common"
import { ButtonModule } from "primeng/button"
import { TagModule } from "primeng/tag"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { InputTextModule } from "primeng/inputtext"
import { MultiSelectModule } from "primeng/multiselect"
import { SelectModule } from "primeng/select"
import { ProgressBarModule } from "primeng/progressbar"
import { HttpClientModule } from "@angular/common/http"
import { FormsModule } from "@angular/forms"
import { SidebarModule } from "primeng/sidebar"
import { SliderModule } from "primeng/slider"
import { CalendarModule } from "primeng/calendar"
import { CheckboxModule } from "primeng/checkbox"
import type { SortEvent } from "primeng/api"

@Component({
  selector: "app-orders",
  imports: [
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
  providers: [CustomerService],
  standalone: true,
})
export class OrdersComponent implements OnInit {
  marginLeft = 200
  isSidebarOpen = false
  isDetailSidebarVisible = false
  isEditing = false
  selectedCustomer: Customer | null = null
  originalCustomer: Customer | null = null
  countries: any[] = []

  sortMeta = [
    { field: "name", order: 1 },
  ]

  constructor(
    private linkService: LinkService,
    public customerService: CustomerService,
  ) {
    this.linkService.isSidebarOpen$.subscribe((value) => {
      this.isSidebarOpen = value
    })
  }

  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 200
    return this.marginLeft
  }

  customers!: Customer[]
  representatives!: Representative[]
  statuses!: any[]
  loading = true
  activityValues: number[] = [0, 100]
  searchValue: string | undefined

  ngOnInit() {
    this.customerService.getCustomersLarge()
      .then((customers) => {
        this.customers = customers
        this.loading = false
        this.customers.forEach((customer) => {
          if (customer.date) {
            customer.date = new Date(customer.date)
          }
        })
      })
      .catch(() => {
        this.customerService.getMockCustomers().then((customers) => {
          this.customers = customers
          this.loading = false
        })
      })

    this.representatives = [
      { name: "Amy Elsner", image: "amyelsner.png" },
      { name: "Anna Fali", image: "annafali.png" },
      { name: "Asiya Javayant", image: "asiyajavayant.png" },
      { name: "Bernardo Dominic", image: "bernardodominic.png" },
      { name: "Elwin Sharvill", image: "elwinsharvill.png" },
      { name: "Ioni Bowcher", image: "ionibowcher.png" },
      { name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
      { name: "Onyama Limba", image: "onyamalimba.png" },
      { name: "Stephen Shaw", image: "stephenshaw.png" },
      { name: "Xuxue Feng", image: "xuxuefeng.png" },
    ]

    this.statuses = [
      { label: "Unqualified", value: "unqualified" },
      { label: "Qualified", value: "qualified" },
      { label: "New", value: "new" },
      { label: "Negotiation", value: "negotiation" },
      { label: "Renewal", value: "renewal" },
      { label: "Proposal", value: "proposal" },
    ]

    // Expanded countries list
    this.countries = [
      { name: "Algeria", code: "dz" },
      { name: "Egypt", code: "eg" },
      { name: "Panama", code: "pa" },
      { name: "Slovenia", code: "si" },
      { name: "South Africa", code: "za" },
      { name: "Brazil", code: "br" },
      { name: "France", code: "fr" },
      { name: "Japan", code: "jp" },
      { name: "Germany", code: "de" },
      { name: "Italy", code: "it" },
      { name: "China", code: "cn" },
      { name: "Australia", code: "au" },
      { name: "Mexico", code: "mx" },
      { name: "United Kingdom", code: "gb" },
      { name: "India", code: "in" }
    ]
  }

  clear(table: Table) {
    table.clear()
    this.searchValue = ""
  }

  customSort(event: SortEvent) {
    console.log("Sort event:", event)
  }

  getSeverity(status: string) {
    switch (status?.toLowerCase()) {
      case "unqualified":
        return "danger"
      case "qualified":
        return "success"
      case "new":
        return "info"
      case "negotiation":
        return "warn"
      case "renewal":
        return null
      case "proposal":
        return "success"
      default:
        return null
    }
  }

  viewCustomerDetails(customer: Customer) {
    this.selectedCustomer = { ...customer, date: customer.date ? new Date(customer.date) : undefined }
    this.isDetailSidebarVisible = true
    this.isEditing = false
    console.log("Viewing customer:", this.selectedCustomer)
  }

  startEditing() {
    if (this.selectedCustomer) {
      this.originalCustomer = { ...this.selectedCustomer }
      this.isEditing = true
      this.isDetailSidebarVisible = true // Ensure sidebar stays open
      console.log("Starting edit mode for:", this.selectedCustomer)
    }
  }

  saveCustomer() {
    if (this.selectedCustomer && this.selectedCustomer.id) {
      const index = this.customers.findIndex(c => c.id === this.selectedCustomer!.id)
      if (index !== -1) {
        this.customers[index] = { ...this.selectedCustomer }
        console.log("Saved customer:", this.customers[index])
      }
      this.isEditing = false
      this.originalCustomer = null
    }
  }

  cancelEditing() {
    if (this.originalCustomer) {
      this.selectedCustomer = { ...this.originalCustomer }
    }
    this.isEditing = false
    this.originalCustomer = null
    console.log("Cancelled editing")
  }

  closeDetailSidebar() {
    this.isDetailSidebarVisible = false
    this.isEditing = false
    this.selectedCustomer = null
    this.originalCustomer = null
    console.log("Sidebar closed")
  }
}