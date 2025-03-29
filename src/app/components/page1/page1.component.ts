import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { LinkService } from '../../link.service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag,CdkDropList,CdkDragRelease } from '@angular/cdk/drag-drop';
import { ProjectServiceService } from '../../project-service.service';
import { SidebarService } from '../../sidebar.service';
import { addWeeks, subWeeks } from 'date-fns';
import { WeekManagerServiceService } from '../../week-manager-service.service';
import { CalendarService, DayData } from '../../calendar.service';
import { startOfWeek, addDays, format } from 'date-fns';


export interface Order {
  id: number;
  name: string;
  customer_name: string;
  background: string;
  created_date: Date;
  assigned_to:string;
  updated_date:Date;
  price:number;
  notes:string;
  total_cost:number;
  img_url:string;
}

@Component({
  selector: 'app-page1',
  standalone: true,
  imports: [CdkDropList,CdkDrag, CommonModule], 
  templateUrl: './page1.component.html',
  styleUrl: './page1.component.css'
})
export class Page1Component {
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

  onDragStart(event: DragEvent, order: any) {
    if (!this.isDraggable(order)) {
      event.preventDefault(); // منع السحب إذا لم يكن مسموحًا
      return;
    }
    event.dataTransfer?.setData("text/plain", JSON.stringify(order));
  }

  droppedOrders: Order[] = [];

  // عند الإفلات، يتم نقل الكارت إذا لم يكن لونه أبيض
  onDragRelease(event: CdkDragRelease, order: Order) {
    if (order.background !== 'white') {
      this.droppedOrders.push(order);
    }
  }
  // دالة لإضافة الكروت الملونة عند الضغط على الزرار
  addSimilarOrders(order: Order, index: number) {
    const newOrders: Order[] = [
      { ...order, background: '#68d768' },
      { ...order, background: '#e7e766' },
      { ...order, background: '#f76a6a' }
    ];
    this.orders.splice(index + 1, 0, ...newOrders);
  }

  orders: Order[] = [
    { id: 1, name: 'Order 1', customer_name: 'Customer Name A', background: 'white',created_date: new Date('23/03/2025') ,assigned_to:'assigned to A',updated_date: new Date('23/04/2025'), price: 2000, notes:'Nostes A',total_cost: 8000,img_url: 'assets/images/order1.jpg' },
    { id: 2, name: 'Order 2', customer_name: 'Customer Name B', background: 'white' ,created_date: new Date('24/03/2025') ,assigned_to:'assigned to B',updated_date: new Date('24/04/2025'), price: 2000, notes:'Nostes B',total_cost: 8000,img_url: 'assets/images/order2.jpg'},
    { id: 3, name: 'Order 3', customer_name: 'Customer Name C', background: 'white' ,created_date: new Date('25/03/2025') ,assigned_to:'assigned to C',updated_date: new Date('25/04/2025'), price: 2000, notes:'Nostes C',total_cost: 8000,img_url: 'assets/images/order3.jpg'},
  ];


  drop(event: CdkDragDrop<Order[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  trackById(index: number, item: Order): number {
    return item.id;
  }

  ngOnInit(): void {}

  // القوائم الخاصة بكل يوم
  sundayList: Order[] = [];
  mondayList: Order[] = [];
  tuesdayList: Order[] = [];
  wednesdayList: Order[] = [];
  thursdayList: Order[] = [];
  fridayList: Order[] = [];
  saturdayList: Order[] = [];

  constructor(private linkService: LinkService,private projectService: ProjectServiceService,private sidebarService: SidebarService, private weekManager: WeekManagerServiceService,private calendarService: CalendarService) {
    this.linkService.isSidebarOpen$.subscribe((value) => {
      this.isSidebarOpen = value;
    });
    this.sidebarService.rightSidebarState$.subscribe(state => {
      this.isRightSidebarOpen = state;
    });
    this.currentWeek = this.weekManager.generateWeekData(new Date());
    this.generateWeekDays();
  }

  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  // تحديث المسافة الجانبية حسب حالة الـ Sidebar
  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }

// دالة للتحقق من إمكانية سحب الكارد بناءً على اللون
isDraggable(order: any) {
  return order.background !== 'white'; // يمكن سحب الكارد التي خلفيتها ليست بيضاء
}

// حفظ بيانات الكارد عند بدء السحب

// التأكد من إمكانية إفلات الكارد في المنطقة المحددة
onDragOver(event: DragEvent) {
  event.preventDefault(); // للسماح بإفلات الكارد
}



// إضافة الكارد في مكان معين (مثل Sunday)

// دالة لإدراج الكارد في مكان محدد
insertOrderAtIndex(order: any, index: number) {
  this.orders.splice(index, 0, order); // إدراج الكارد في المكان المطلوب
}


handleDrop(event: DragEvent, index: number) {
  event.preventDefault();
  const data = event.dataTransfer?.getData("text/plain");
  
  if (!data) return;
  
  const droppedOrder = JSON.parse(data);
  this.insertOrderAtIndex(droppedOrder, index);
}

startDrag(event: MouseEvent, order: any) {
  if (!this.isDraggable(order)) return;

  const card = (event.target as HTMLElement).closest(".order-card") as HTMLElement;
  if (!card) return;

  let shiftX = event.clientX - card.getBoundingClientRect().left;
  let shiftY = event.clientY - card.getBoundingClientRect().top;

  const moveAt = (pageX: number, pageY: number) => {
    card.style.position = "absolute";
    card.style.zIndex = "1000";
    card.style.left = pageX - shiftX + "px";
    card.style.top = pageY - shiftY + "px";
  };

  const onMouseMove = (e: MouseEvent) => {
    moveAt(e.pageX, e.pageY);
  };

  document.addEventListener("mousemove", onMouseMove);

  card.onmouseup = function () {
    document.removeEventListener("mousemove", onMouseMove);
    card.onmouseup = null;
  };
}




////////////////////////////////////////////////////////////////////////


currentWeek: any;


/////////////////////////////////////////////////////////////////////////

currentDate: Date = new Date();
  daysOfWeek: DayData[] = [];

  // توليد أيام الأسبوع الحالي
  generateWeekDays(): void {
    this.daysOfWeek = [];
    const startOfWeekDate = startOfWeek(this.currentDate);
    
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(startOfWeekDate, i);
      this.daysOfWeek.push(this.calendarService.getDayData(dayDate));
    }
  }

  // التنقل بين الأسابيع
  nextWeek(): void {
    this.currentDate = addWeeks(this.currentDate, 1);
    this.generateWeekDays();
  }

  prevWeek(): void {
    this.currentDate = subWeeks(this.currentDate, 1);
    this.generateWeekDays();
  }

  // معالجة السحب والإفلات
  onDrop(event: CdkDragDrop<any[]>, targetDate: string): void {
    if (event.previousContainer === event.container) return;

    const draggedCard = event.previousContainer.data[event.previousIndex];
    const targetDay = this.calendarService.getDayData(new Date(targetDate));

    transferArrayItem(
      event.previousContainer.data,
      targetDay.cards,
      event.previousIndex,
      event.currentIndex
    );

    this.calendarService.saveData();
  }
  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy');
  }
}
