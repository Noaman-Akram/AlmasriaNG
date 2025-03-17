import { Component , OnInit } from '@angular/core';
import { RouterOutlet, Router , NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TopbarComponent } from './components/topbar/topbar.component';
import { TableModule } from 'primeng/table';
import { PrimeNG } from 'primeng/config';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SupabaseService } from './services/supabase.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, CommonModule, DragDropModule, ButtonModule, PanelMenuModule,TableModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  constructor(private primeng: PrimeNG , private router: Router ) {
    // Subscribe to router events to detect route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Update the boolean value based on the current route
        this.showTopbar = event.url !== '/signin';
      }
    });
  }

  ngOnInit() {
      this.primeng.ripple.set(true);
  }
  title = 'proj1';
  showTopbar = true; // Default value is true

}