// src/app/components/table-list/table-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService }      from '../../services/supabase.service';
import { CommonModule }         from '@angular/common';
import { RouterModule }         from '@angular/router';

@Component({
  selector: 'app-table-list',
  standalone: true,             // ← mark it standalone
  imports: [
    CommonModule,                // ← for *ngIf, *ngFor
    RouterModule                 // ← for [routerLink]
  ],
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  marginLeft = 300; 
  isSidebarOpen = false;
  tableNames: string[] = [];
  expanded:   { [tbl: string]: boolean } = {};
  rows:       { [tbl: string]: any[]   } = {};
  cols:       { [tbl: string]: string[] } = {};

  constructor(private sb: SupabaseService) {}

  updateMargin() {
    this.marginLeft = this.isSidebarOpen ? 100 : 300;
    return this.marginLeft;
  }

  async ngOnInit() {
    this.tableNames = await this.sb.listTables();
    this.tableNames.forEach(t => this.expanded[t] = false);
  }

  async toggle(tbl: string) {
    this.expanded[tbl] = !this.expanded[tbl];
    if (this.expanded[tbl] && !this.rows[tbl]) {
      const data = await this.sb.getRows(tbl);
      this.rows[tbl] = data;
      this.cols[tbl] = data.length ? Object.keys(data[0]) : [];
    }
  }
}
