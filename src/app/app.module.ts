import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './components/shared/landing/landing.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { RegisterComponent } from './pages/register/register.component';
import { PanelComponent } from './components/panel/panel.component';
import { GenerateComponent } from './components/generate/generate.component';
import { UserQuotationsComponent } from './pages/user-quotations/user-quotations.component';
import { UserComponent } from './pages/user/user.component';
import { SearchQuotationsComponent } from './components/search-quotations/search-quotations.component';
import { LoadingComponent } from './components/shared/loading/loading.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShortDecimalPipe, PricePipe } from './pipes';
import { SearchComponent } from './components/shared/search/search.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SettingsComponent } from './pages/settings/settings.component';
import { QuotationDetailComponent } from './pages/quotation-detail/quotation-detail.component';
import { QuotationDataFormComponent } from './components/shared/quotation-data-form/quotation-data-form.component';
import { QuotationComponent } from './components/quotation/quotation.component';
import { EditionDropdownComponent } from './components/edition-dropdown/edition-dropdown.component';
import { ListItemComponent } from './components/list/list-item/list-item.component';

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
    PanelComponent,
    GenerateComponent,
    UserQuotationsComponent,
    UserComponent,
    SearchQuotationsComponent,
    LoadingComponent,
    SearchComponent,
    SettingsComponent,
    QuotationDetailComponent,
    QuotationDataFormComponent,
    QuotationComponent,
    EditionDropdownComponent,
    ListItemComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
