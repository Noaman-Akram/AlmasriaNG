import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // متغير يتحكم في حالة الـ LeftSidebar
  private leftSidebarState = new BehaviorSubject<boolean>(false);
  leftSidebarState$ = this.leftSidebarState.asObservable();

  // متغير يتحكم في حالة الـ RightSidebar
  private rightSidebarState = new BehaviorSubject<boolean>(false);
  rightSidebarState$ = this.rightSidebarState.asObservable();

  // دالة لتغيير حالة الـ LeftSidebar
  toggleLeftSidebar(state: boolean): void {
    this.leftSidebarState.next(state);
    // إذا تم فتح الـ LeftSidebar، نقفل الـ RightSidebar
    if (state) {
      this.rightSidebarState.next(false);
    }
  }

  // دالة لتغيير حالة الـ RightSidebar
  toggleRightSidebar(state: boolean): void {
    this.rightSidebarState.next(state);
    // إذا تم فتح الـ RightSidebar، نقفل الـ LeftSidebar
    if (state) {
      this.leftSidebarState.next(false);
    }
  }
}
