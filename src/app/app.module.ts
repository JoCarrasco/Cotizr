import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { Angular2PrestaModule, Angular2PrestaConfiguration } from 'angular2-presta';
import { APP_BASE_HREF, Location } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './components/shared/landing/landing.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PanelComponent } from './components/panel/panel.component';
import { GenerateComponent } from './components/generate/generate.component';
import { GenerateProductsComponent } from './components/generate/children/generate-products/generate-products.component';
import { GenerateDataComponent } from './components/generate/children/generate-data/generate-data.component';
import { UserQuotationsComponent } from './pages/user-quotations/user-quotations.component';
import { UserComponent } from './pages/user/user.component';
import { SearchQuotationsComponent } from './components/search-quotations/search-quotations.component';
import { LoadingComponent } from './components/shared/loading/loading.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PrestashopInfo } from './shared';
import { ShortDecimalPipe, PricePipe } from './pipes';
import { SearchComponent } from './components/shared/search/search.component';

export const a2pConfig: Angular2PrestaConfiguration = {
  apiKey: PrestashopInfo.wsKey,
  shopUrl: PrestashopInfo.shopAPI
};

@NgModule({
  declarations: [
    AppComponent,
    PricePipe,
    ShortDecimalPipe,
    HomeComponent,
    HeaderComponent,
    LoginComponent,
    LandingComponent,
    ToastComponent,
    RegisterComponent,
    AdminComponent,
    PanelComponent,
    GenerateComponent,
    GenerateProductsComponent,
    GenerateDataComponent,
    UserQuotationsComponent,
    UserComponent,
    SearchQuotationsComponent,
    LoadingComponent,
    SearchComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    Angular2PrestaModule.forRoot(a2pConfig),
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
