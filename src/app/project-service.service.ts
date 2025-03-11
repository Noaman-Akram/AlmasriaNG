import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProjectServiceService {
  selectedProjects: string[] = [];

  constructor() {
    // التحقق إذا كانت البيانات موجودة في localStorage
    const savedProjects = localStorage.getItem('selectedProjects');
    if (savedProjects) {
      this.selectedProjects = JSON.parse(savedProjects);  // استرجاع البيانات من localStorage
    } else {
      this.selectedProjects = [];  // لو مفيش بيانات موجودة، نبدأ بمصفوفة فارغة
    }
  }

  // إضافة مشروع جديد إلى الـ array
  addProjectToSelected(projectName: string) {
    this.selectedProjects.push(projectName);
    this.saveProjectsToLocalStorage();  // حفظ التحديثات في localStorage
  }

  // استرجاع الـ projects المضافة
  getSelectedProjects() {
    return this.selectedProjects;
  }

  // تخزين الـ projects في localStorage
  private saveProjectsToLocalStorage() {
    localStorage.setItem('selectedProjects', JSON.stringify(this.selectedProjects));
  }

}
