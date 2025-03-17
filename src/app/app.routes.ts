import { Routes } from '@angular/router';
import { Page1Component } from './Components/page1/page1.component';
import { Page2Component } from './Components/page2/page2.component';
import { Page3Component } from './Components/page3/page3.component';
import { Page4Component } from './Components/page4/page4.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FinanceComponent } from './components/finance/finance.component';
import { OrdersComponent } from './components/orders/orders.component';
import { ArdS3rComponent } from './Components/ard-s3r/ard-s3r.component';
import { GorderComponent } from './Components/gorder/gorder.component';
import {SigninComponent} from './Components/signin/signin.component';
import { GadwalComponent } from './components/gadwal/gadwal.component';
import { CdkDragDropConnectedSortingExampleComponent } from './components/cdk-drag-drop-connected-sorting-example/cdk-drag-drop-connected-sorting-example.component';

export const routes: Routes = [
    { path:'',redirectTo:'ard-s3r',pathMatch:'full' }, // Default route (Home)
  { path: 'page1', component: Page1Component,title:'page1' },
  { path: 'page2', component: Page2Component,title:'page2' },
  { path: 'page3', component: Page3Component,title:'page3' },
  { path: 'page4', component: Page4Component,title:'page4' },
  { path: 'dashboard', component: DashboardComponent,title:'Dashboard' },
  { path: 'finance', component: FinanceComponent,title:'Finance' },
  { path: 'orders', component: OrdersComponent,title:'Orders' },
  { path: 'ard-s3r', component: ArdS3rComponent,title:'عرض سعر' },
  { path: 'gorder', component: GorderComponent,title:'تشغيل اوردر' },
  { path: 'signin', component: SigninComponent,title:'signin' },
  { path: 'gadwal', component: GadwalComponent,title:'جدول' },
  { path: 'cdk-drag-drop-connected-sorting-example', component: CdkDragDropConnectedSortingExampleComponent,title:'/cdk-drag-drop-connected-sorting-example' },
  { path: '**', redirectTo: '' },
];
