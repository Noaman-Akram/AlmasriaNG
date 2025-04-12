// calendar.service.ts
import { Injectable } from '@angular/core';
import { addDays, startOfWeek, format, addWeeks, subWeeks } from 'date-fns';

export interface DayData { // ← تمت إضافة `export`
  date: string;
  cards: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  daysMap: Map<string, DayData> = new Map();
  currentDate: Date = new Date();

  constructor() {
    this.loadData();
  }

  // توليد/استرجاع بيانات يوم معين
  getDayData(date: Date): DayData {
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!this.daysMap.has(dateKey)) {
      this.daysMap.set(dateKey, {
        date: dateKey,
        cards: []
      });
    }
    return this.daysMap.get(dateKey)!;
  }

  // حفظ البيانات في localStorage
  saveData(): void {
    localStorage.setItem('calendarData', JSON.stringify([...this.daysMap]));
  }

  // تحميل البيانات الم保存تة
  private loadData(): void {
    const savedData = localStorage.getItem('calendarData');
    if (savedData) {
      this.daysMap = new Map(JSON.parse(savedData));
    }
  }
}
