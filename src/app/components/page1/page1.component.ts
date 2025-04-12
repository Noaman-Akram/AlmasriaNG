import { LinkService } from '../../link.service';
import { SidebarService } from '../../sidebar.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList,CdkDragRelease } from '@angular/cdk/drag-drop';
import { Component, type OnInit} from "@angular/core"
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns"
import { CommonModule } from "@angular/common"
import { trigger, transition, style, animate, state } from "@angular/animations"
import { FormsModule } from "@angular/forms"

interface OrderStage {
  scheduled: string | null
}

interface Order {
  id: number
  title: string
  customer: string
  stages: {
    cutting: OrderStage
    installing: OrderStage
    finishing: OrderStage
  }
  name: string
  customer_name: string
  created_date: Date
  assigned_to: string
  updated_date: Date
  price: number
  notes: string
  total_cost: number
  img_url: string
}

interface StageDefinition {
  id: string
  label: string
  color: string
}

interface DraggingStage {
  orderId: number
  stageId: string
}

interface ScheduledItem {
  orderId: number
  orderTitle: string
  stageId: string
  stage: StageDefinition
}

@Component({
  selector: 'app-page1',
  standalone: true,
  imports: [CommonModule,CdkDropList,CdkDrag,FormsModule], 
  templateUrl: './page1.component.html',
  styleUrl: './page1.component.css',
  animations: [
    trigger("expandCollapse", [
      state("collapsed", style({ height: "0", overflow: "hidden" })),
      state("expanded", style({ height: "*", overflow: "hidden" })),
      transition("collapsed <=> expanded", [animate("200ms ease-in-out")]),
    ]),
  ],
})
export class Page1Component  implements OnInit{
 marginLeft = 300; // Default margin
   isSidebarOpen = false;
 
   constructor(private linkService: LinkService, private sidebarService: SidebarService) {
     // Subscribe to changes in isSidebarOpen
     this.linkService.isSidebarOpen$.subscribe((value) => {
       this.isSidebarOpen = value;
     });
     this.sidebarService.rightSidebarState$.subscribe(state => {
      this.isRightSidebarOpen = state;
    });
   }
 
   // Function to update margin based on isSidebarOpen
   updateMargin() {
     this.marginLeft = this.isSidebarOpen ? 100 : 300;
     return this.marginLeft;
   }

     isRightSidebarOpen: boolean = false; // حالة الـ Sidebar
   
     // دالة لتغيير حالة الـ Sidebar
     toggleRightSidebar(): void {
       this.isRightSidebarOpen = !this.isRightSidebarOpen;
     }
     showDetails(order: Order): void {
       this.selectedOrder = order;  // Set the selected order's details
       this.isRightSidebarOpen = true; 
     }
     selectedOrder: Order | null = null;

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  currentDate = new Date()
  orders: Order[] = []
  expandedOrders: Record<number, boolean> = {}
  draggingStage: DraggingStage | null = null
  weekDates: Date[] = []
  weekDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  today = new Date() // Store today's date to avoid creating new Date() in template

  // New order form
  showNewOrderForm = false
  newOrder = {
    title: "",
    customer: "",
  }

  // Define initial orders directly in the component
  initialOrders: Order[] = [
    {
      id: 1,
      title: "K-112",
      customer: "Mostafa Fahmy",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Kitchen Renovation",
      customer_name: "Mostafa Fahmy",
      created_date: new Date(),
      assigned_to: "Team A",
      updated_date: new Date(),
      price: 5000,
      notes: "Standard kitchen renovation",
      total_cost: 4200,
      img_url: "",
    },
    {
      id: 2,
      title: "K-113",
      customer: "John Doe",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Bathroom Remodel",
      customer_name: "John Doe",
      created_date: new Date(),
      assigned_to: "Team B",
      updated_date: new Date(),
      price: 3500,
      notes: "Master bathroom remodel",
      total_cost: 3000,
      img_url: "",
    },
    {
      id: 3,
      title: "K-114",
      customer: "No3man",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Order 3",
      customer_name: "Customer Name C",
      created_date: new Date(2025, 6, 15), // Fixed date format (month is 0-indexed)
      assigned_to: "assigned to C",
      updated_date: new Date(2025, 8, 30), // Fixed date format (month is 0-indexed)
      price: 6000,
      notes: "Notes C",
      total_cost: 10000,
      img_url: "assets/images/order3.jpg",
    },
    {
      id: 4,
      title: "K-116",
      customer: "Salah",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Order 4",
      customer_name: "Customer Name D",
      created_date: new Date(2025, 7, 17), // Fixed date format (month is 0-indexed)
      assigned_to: "assigned to D",
      updated_date: new Date(2025, 9, 30), // Fixed date format (month is 0-indexed)
      price: 7000,
      notes: "Notes D",
      total_cost: 12000,
      img_url: "assets/images/order3.jpg",
    },
    {
      id: 5,
      title: "K-117",
      customer: "Tarek",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Order 5",
      customer_name: "Customer Name E",
      created_date: new Date(2025, 6, 19), // Fixed date format (month is 0-indexed)
      assigned_to: "assigned to E",
      updated_date: new Date(2025, 11, 29), // Fixed date format (month is 0-indexed)
      price: 8000,
      notes: "Notes E",
      total_cost: 15000,
      img_url: "assets/images/order3.jpg",
    },
    {
      id: 6,
      title: "K-118",
      customer: "Malek",
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      name: "Order 6",
      customer_name: "Customer Name F",
      created_date: new Date(2025, 6, 19), // Fixed date format (month is 0-indexed)
      assigned_to: "assigned to F",
      updated_date: new Date(2025, 11, 29), // Fixed date format (month is 0-indexed)
      price: 8000,
      notes: "Notes F",
      total_cost: 15000,
      img_url: "assets/images/order3.jpg",
    },
  ]

  readonly ORDER_STAGES: StageDefinition[] = [
    { id: "cutting", label: "Cutting", color: "bg-red-100" },
    { id: "installing", label: "Installing", color: "bg-yellow-100" },
    { id: "finishing", label: "Finishing", color: "bg-green-100" },
  ]

  ngOnInit(): void {
    this.loadOrders()
    this.calculateWeekDates()
  }

  loadOrders(): void {
    try {
      // Use the orders defined directly in the component
      this.orders = [...this.initialOrders]

      // Check if there are saved orders in localStorage
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders)
        if (parsedOrders && parsedOrders.length > 0) {
          // Process saved orders
          this.orders = parsedOrders.map((order: any) => {
            const now = new Date()
            return {
              ...order,
              stages: {
                cutting: { scheduled: order.stages?.cutting?.scheduled || null },
                installing: { scheduled: order.stages?.installing?.scheduled || null },
                finishing: { scheduled: order.stages?.finishing?.scheduled || null },
              },
              // Set default values for new fields if they don't exist
              name: order.name || order.title || "",
              customer_name: order.customer_name || order.customer || "",
              created_date: order.created_date ? new Date(order.created_date) : now,
              assigned_to: order.assigned_to || "",
              updated_date: order.updated_date ? new Date(order.updated_date) : now,
              price: order.price || 0,
              notes: order.notes || "",
              total_cost: order.total_cost || 0,
              img_url: order.img_url || "",
            }
          })
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      // If there's an error, fall back to the initial orders
      this.orders = [...this.initialOrders]
    }
  }

  // Force reload orders from initial data
  resetOrders(): void {
    localStorage.removeItem("orders")
    this.orders = [...this.initialOrders]
    this.saveOrders()
  }

  saveOrders(): void {
    try {
      localStorage.setItem("orders", JSON.stringify(this.orders))
    } catch (error) {
      console.error("Error saving orders:", error)
    }
  }

  addNewOrder(): void {
    if (!this.newOrder.title || !this.newOrder.customer) {
      alert("Please fill in all fields")
      return
    }

    // Generate a new ID (highest existing ID + 1)
    const newId = this.orders.length > 0 ? Math.max(...this.orders.map((order) => order.id)) + 1 : 1
    const now = new Date()

    // Create the new order with all required fields
    const order: Order = {
      id: newId,
      title: this.newOrder.title,
      customer: this.newOrder.customer,
      stages: {
        cutting: { scheduled: null },
        installing: { scheduled: null },
        finishing: { scheduled: null },
      },
      // Add the new fields with default values
      name: this.newOrder.title,
      customer_name: this.newOrder.customer,
      created_date: now,
      assigned_to: "",
      updated_date: now,
      price: 0,
      notes: "",
      total_cost: 0,
      img_url: "",
    }

    // Add to orders array
    this.orders = [...this.orders, order]

    // Save to localStorage
    this.saveOrders()

    // Reset form
    this.newOrder = { title: "", customer: "" }
    this.showNewOrderForm = false
  }

  deleteOrder(orderId: number): void {
    if (confirm("Are you sure you want to delete this order?")) {
      this.orders = this.orders.filter((order) => order.id !== orderId)
      this.saveOrders()
    }
  }

  calculateWeekDates(): void {
    const startOfCurrentWeek = startOfWeek(this.currentDate, { weekStartsOn: 0 })
    this.weekDates = Array(7)
      .fill(0)
      .map((_, i) => addDays(startOfCurrentWeek, i))
  }

  goToPreviousWeek(): void {
    const newDate = subWeeks(this.currentDate, 1)
    const sixMonthsAgo = subWeeks(new Date(), 24)
    if (newDate >= sixMonthsAgo) {
      this.currentDate = newDate
      this.calculateWeekDates()
    }
  }

  goToNextWeek(): void {
    const newDate = addWeeks(this.currentDate, 1)
    const sixMonthsAhead = addWeeks(new Date(), 24)
    if (newDate <= sixMonthsAhead) {
      this.currentDate = newDate
      this.calculateWeekDates()
    }
  }

  toggleOrder(orderId: number): void {
    this.expandedOrders[orderId] = !this.expandedOrders[orderId]
  }

  getScheduledItemsForDate(date: Date): ScheduledItem[] {
    const items: ScheduledItem[] = []
    this.orders.forEach((order) => {
      if (!order.stages) return // Skip if order doesn't have stages

      Object.entries(order.stages).forEach(([stageId, stage]) => {
        if (stage?.scheduled && isSameDay(new Date(stage.scheduled), date)) {
          const stageDefinition = this.ORDER_STAGES.find((s) => s.id === stageId)
          if (stageDefinition) {
            items.push({
              orderId: order.id,
              orderTitle: order.title,
              stageId,
              stage: stageDefinition,
            })
          }
        }
      })
    })
    return items
  }

  handleDragStart(orderId: number, stageId: string): void {
    this.draggingStage = { orderId, stageId }
  }

  handleDrop(date: Date): void {
    if (this.draggingStage) {
      const updatedOrders = this.orders.map((order) => {
        if (order.id === this.draggingStage!.orderId) {
          const updatedStages = { ...order.stages }
          updatedStages[this.draggingStage!.stageId as keyof typeof updatedStages] = {
            ...updatedStages[this.draggingStage!.stageId as keyof typeof updatedStages],
            scheduled: date.toISOString(),
          }
          return {
            ...order,
            stages: updatedStages,
            updated_date: new Date(), // Update the updated_date when a stage is scheduled
          }
        }
        return order
      })
      this.orders = updatedOrders
      this.saveOrders()
      this.draggingStage = null
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault()
  }

  formatDate(date: Date, formatString: string): string {
    return format(date, formatString)
  }

  // Helper method to safely check if a date is today
  isToday(date: Date): boolean {
    return isSameDay(date, this.today)
  }

  getStartOfWeek(): Date {
    return startOfWeek(this.currentDate, { weekStartsOn: 0 })
  }

  getEndOfWeek(): Date {
    return addDays(this.getStartOfWeek(), 6)
  }

  safeFormatScheduledDate(stage: OrderStage, formatString: string): string {
    if (!stage.scheduled) return ""
    return this.formatDate(new Date(stage.scheduled), formatString)
  }
}

