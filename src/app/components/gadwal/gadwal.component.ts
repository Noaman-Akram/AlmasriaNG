import { Component , OnInit} from '@angular/core';
import { LinkService } from '../../link.service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gadwal',
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: './gadwal.component.html',
  styleUrl: './gadwal.component.css'
})
export class GadwalComponent implements OnInit {
  todo: string[] = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep','no3','malek'];

  repeatedTodo: { text: string, color: string }[] = [];

  sundayList: { text: string, color: string }[] = [];
  mondayList: { text: string, color: string }[] = [];
  tuesdayList: { text: string, color: string }[] = [];
  wednesdayList: { text: string, color: string }[] = [];
  thursdayList: { text: string, color: string }[] = [];
  fridayList: { text: string, color: string }[] = [];
  saturdayList: { text: string, color: string }[] = [];

  ngOnInit() {
    this.generateRepeatedTodo();
  }

  // دالة لتكرار العناصر 3 مرات
  generateRepeatedTodo() {
    const colors = ['rgb(220 53 69)', '#ffc107', '#198754'];
    this.repeatedTodo = this.todo.flatMap((item) =>
      colors.map((color) => ({ text: item, color }))
    );
  }

  drop(event: CdkDragDrop<{ text: string, color: string }[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  
  getColor(index: number): string {
    const colors = ['red', 'yellow', 'green'];
    return colors[index % colors.length];
  }

  marginLeft = 200; // Default margin
    isSidebarOpen = false;
  
    constructor(private linkService: LinkService) {
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
    
}
