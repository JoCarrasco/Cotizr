import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GroupSeparatorPipe } from './pipes/group-separator.pipe';
import { ShortDecimalPipe } from './pipes/short-decimals.pipe';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { Angular2PrestaModule, Angular2PrestaConfiguration } from 'angular2-presta';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/shared/landing/landing.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { PanelComponent } from './components/panel/panel.component';
import { GenerateComponent } from './components/generate/generate.component';
import { GenerateProductsComponent } from './components/generate/children/generate-products/generate-products.component';
import { GenerateDataComponent } from './components/generate/children/generate-data/generate-data.component';
import { UserQuotationsComponent } from './components/user-quotations/user-quotations.component';
import { UserComponent } from './components/user/user.component';
import { SearchQuotationsComponent } from './components/search-quotations/search-quotations.component';
import { LoadingComponent } from './components/shared/loading/loading.component';

import { APP_BASE_HREF, Location } from '@angular/common';

const prestashopConfiguration: Angular2PrestaConfiguration = {
  apiKey: 'IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU',
  imageApiKey: 'KFFHJS6IYEINF34856EN35GINGMGNK25',
  shopUrl: 'https://officenet.net.ve/api/'
}

@NgModule({
  declarations: [
    AppComponent,
    GroupSeparatorPipe,
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
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    Angular2PrestaModule.forRoot(prestashopConfiguration)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
