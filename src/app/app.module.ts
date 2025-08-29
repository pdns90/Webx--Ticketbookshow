import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BannerComponent } from './banner/banner.component';
import { SeatbookComponent } from './seatbook/seatbook.component';
import { OrdersummaryComponent } from './ordersummary/ordersummary.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThankyoupageComponent } from './thankyoupage/thankyoupage.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminAuthGuard } from './helper/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './helper/jwt.interceptor';
import { PromotionCodeComponent } from './promotion-code/promotion-code.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { PromotionCodeListComponent } from './promotion-code-list/promotion-code-list.component';
// import { PromotioncodeComponent } from './promotioncode/promotioncode.component';

 
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    BannerComponent,
    SeatbookComponent,
    OrdersummaryComponent,
    ThankyoupageComponent,
    DashboardComponent,
    PromotionCodeComponent,
    AdminHeaderComponent,
    PromotionCodeListComponent,
    // PromotioncodeComponent,
     
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [AdminAuthGuard, 
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
