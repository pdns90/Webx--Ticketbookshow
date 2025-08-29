import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SeatbookComponent } from './seatbook/seatbook.component';
import { OrdersummaryComponent } from './ordersummary/ordersummary.component';
import { ThankyoupageComponent } from './thankyoupage/thankyoupage.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminAuthGuard } from './helper/auth.guard';
import { PromotionCodeComponent } from './promotion-code/promotion-code.component';
import { PromotionCodeListComponent } from './promotion-code-list/promotion-code-list.component';


const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate : [AdminAuthGuard]}, 
  { path: 'promotion-code-list', component: PromotionCodeListComponent, canActivate : [AdminAuthGuard]}, 
  { path: 'add-promotion', component: PromotionCodeComponent, canActivate : [AdminAuthGuard]}, 
  { path: 'promotion-code/:id', component: PromotionCodeComponent, canActivate : [AdminAuthGuard]}, 
  { path: 'seatbook', component: SeatbookComponent }, 
  { path: 'ordersummary', component: OrdersummaryComponent }, 
  {path: 'thank-you', component:ThankyoupageComponent},
  {path: 'register', component:RegisterComponent},
  {path: 'login', component:LoginComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }