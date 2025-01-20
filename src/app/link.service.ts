import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  constructor() { }

  private isSidebarOpenSubject = new BehaviorSubject<boolean>(false);
  isSidebarOpen$ = this.isSidebarOpenSubject.asObservable();

  toggleSidebar() {
    const currentValue = this.isSidebarOpenSubject.value;
    this.isSidebarOpenSubject.next(!currentValue);
  }
}
