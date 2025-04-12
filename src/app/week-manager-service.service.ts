import { Injectable } from '@angular/core';
import { addDays, startOfWeek, format, addWeeks, subWeeks } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class WeekManagerServiceService {
  private readonly storageKey = 'weeksData';
  currentDate: Date = new Date();
  weeks: Map<string, any> = new Map();

  constructor() {
    this.loadSavedData();
  }

  private loadSavedData(): void {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      this.weeks = new Map(JSON.parse(savedData));
    }
  }

  getCurrentWeekId(): string {
    return format(startOfWeek(this.currentDate), 'yyyy-MM-dd');
  }

  private generateDays(startDate: Date): any[] {
    return Array.from({ length: 7 }).map((_, i) => ({
      name: format(addDays(startDate, i), 'EEEE'),
      date: format(addDays(startDate, i), 'dd/MM/yyyy'),
      cards: []
    }));
  }

  generateWeekData(date: Date): any {
    const weekId = format(startOfWeek(date), 'yyyy-MM-dd');
    if (!this.weeks.has(weekId)) {
      this.weeks.set(weekId, {
        days: this.generateDays(startOfWeek(date)), // تمرير startDate هنا
        cards: []
      });
    }
    return this.weeks.get(weekId);
  }
  saveData(): void {
    localStorage.setItem(this.storageKey, JSON.stringify([...this.weeks]));
  }
}
