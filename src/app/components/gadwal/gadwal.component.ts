import { Component, OnInit } from '@angular/core';
import { LinkService } from '../../link.service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ProjectServiceService } from '../../project-service.service';

@Component({
  selector: 'app-gadwal',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: './gadwal.component.html',
  styleUrls: ['./gadwal.component.css']
})
export class GadwalComponent implements OnInit {


  get selectedProjects() {
    return this.projectService.getSelectedProjects();
  }

  todo: string[] = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep', 'no3', 'malek'];
  repeatedTodo: { text: string, color: string }[] = [];

  sundayList: { text: string, color: string }[] = [];
  mondayList: { text: string, color: string }[] = [];
  tuesdayList: { text: string, color: string }[] = [];
  wednesdayList: { text: string, color: string }[] = [];
  thursdayList: { text: string, color: string }[] = [];
  fridayList: { text: string, color: string }[] = [];
  saturdayList: { text: string, color: string }[] = [];

  isEditEnabled: boolean = false;

  constructor(private linkService: LinkService,private projectService: ProjectServiceService) {
    this.linkService.isSidebarOpen$.subscribe((value) => {
      this.isSidebarOpen = value;
    });
  }

  ngOnInit() {
    this.loadFromLocalStorage();
    this.generateRepeatedTodo();
  }

  // توليد المهام الملونة
  generateRepeatedTodo() {
    const colors = ['rgb(220 53 69)', '#ffc107', '#198754'];
    let generatedList = this.todo.flatMap((item) =>
      colors.map((color) => ({ text: item, color }))
    );

    // إزالة المهام اللي تم نقلها بالفعل من repeatedTodo
    const allTasksInDays = [...this.sundayList, ...this.mondayList, ...this.tuesdayList, ...this.wednesdayList, 
                            ...this.thursdayList, ...this.fridayList, ...this.saturdayList];

    this.repeatedTodo = generatedList.filter(task =>
      !allTasksInDays.some(dayTask => dayTask.text === task.text && dayTask.color === task.color)
    );

    this.saveToLocalStorage(); // تحديث Local Storage بعد الفلترة
  }

  // حفظ البيانات في Local Storage
  saveToLocalStorage() {
    const allLists = {
      repeatedTodo: this.repeatedTodo,
      sundayList: this.sundayList,
      mondayList: this.mondayList,
      tuesdayList: this.tuesdayList,
      wednesdayList: this.wednesdayList,
      thursdayList: this.thursdayList,
      fridayList: this.fridayList,
      saturdayList: this.saturdayList
    };
    localStorage.setItem('taskLists', JSON.stringify(allLists));
  }

  // تحميل البيانات من Local Storage
  loadFromLocalStorage() {
    const savedLists = localStorage.getItem('taskLists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      this.repeatedTodo = parsedLists.repeatedTodo || [];
      this.sundayList = parsedLists.sundayList || [];
      this.mondayList = parsedLists.mondayList || [];
      this.tuesdayList = parsedLists.tuesdayList || [];
      this.wednesdayList = parsedLists.wednesdayList || [];
      this.thursdayList = parsedLists.thursdayList || [];
      this.fridayList = parsedLists.fridayList || [];
      this.saturdayList = parsedLists.saturdayList || [];
    }
  }

  // عند سحب العنصر وإفلاته
  drop(event: CdkDragDrop<{ text: string, color: string }[]>) {
    if (this.isEditEnabled) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        const movedItem = event.previousContainer.data[event.previousIndex];
        const targetList = event.container.data;

        // التحقق من عدم تكرار العنصر في نفس القائمة
        const isDuplicate = targetList.some(item => item.text === movedItem.text && item.color === movedItem.color);

        if (!isDuplicate) {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );

          // تحديث repeatedTodo بعد نقل العنصر
          this.repeatedTodo = this.repeatedTodo.filter(item => !(item.text === movedItem.text && item.color === movedItem.color));

          this.saveToLocalStorage();  // حفظ البيانات بعد التحديث
        }
      }
    }
  }

  toggleEdit() {
    this.isEditEnabled = !this.isEditEnabled;
  }

  getColor(index: number): string {
    const colors = ['red', 'yellow', 'green'];
    return colors[index % colors.length];
  }

  marginLeft = 200; // Default margin
  isSidebarOpen = false;

  // تحديث المسافة الجانبية حسب حالة الـ Sidebar
  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 200;
    return this.marginLeft;
  }
}
