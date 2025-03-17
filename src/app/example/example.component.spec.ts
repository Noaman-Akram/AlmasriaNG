import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {
  data: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      // Change 'your_table_name' to the name of your actual table
      this.data = await this.supabaseService.getData('your_table_name');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
