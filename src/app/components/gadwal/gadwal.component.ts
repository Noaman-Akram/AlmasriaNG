import { Component , OnInit} from '@angular/core';
import { LinkService } from '../../link.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-gadwal',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './gadwal.component.html',
  styleUrl: './gadwal.component.css'
})
export class GadwalComponent implements OnInit {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep','55','22','77','99'];

  su: string[] =[];
  mo: string[] =[];
  tu: string[] =[];
  we: string[] =[];
  th: string[] =[];
  fr: string[] =[];
  sa: string[] =[];

  drop(event: CdkDragDrop<string[]>) {
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
    this.saveToLocalStorage(); // Save after every change
  }

  marginLeft = 200; // Default margin
    isSidebarOpen = false;
  
    constructor(private linkService: LinkService) {
      // Subscribe to changes in isSidebarOpen
      this.linkService.isSidebarOpen$.subscribe((value) => {
        this.isSidebarOpen = value;
      });
    }

    ngOnInit() {
      // Load saved data from localStorage
      this.loadFromLocalStorage();
    }
  
    // Function to update margin based on isSidebarOpen
    updateMargin() {
      this.marginLeft = this.isSidebarOpen ? 100 : 200;
      return this.marginLeft;
    }

    saveToLocalStorage() {
      const data = {
        todo: this.todo,
        su: this.su,
        mo: this.mo,
        tu: this.tu,
        we: this.we,
        th: this.th,
        fr: this.fr,
        sa: this.sa
      };
      localStorage.setItem('dragDropData', JSON.stringify(data));
    }
  
    loadFromLocalStorage() {
      const savedData = localStorage.getItem('dragDropData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.todo = parsedData.todo || [];
        this.su = parsedData.su || [];
        this.mo = parsedData.mo || [];
        this.tu = parsedData.tu || [];
        this.we = parsedData.we || [];
        this.th = parsedData.th || [];
        this.fr = parsedData.fr || [];
        this.sa = parsedData.sa || [];
      }
    }
  
    resetData() {
      localStorage.removeItem('dragDropData');
      this.todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep', '55', '22', '77'];
      this.su = [];
      this.mo = [];
      this.tu = [];
      this.we = [];
      this.th = [];
      this.fr = [];
      this.sa = [];
    }
}
