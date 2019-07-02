import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './login.guard';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';
import { HomeComponent, LoginComponent, RegisterComponent, UserQuotationsComponent, UserComponent } from '../pages';
import { PanelComponent } from '../components/panel/panel.component';
import { SearchQuotationsComponent } from '../components/search-quotations/search-quotations.component';
import { GenerateComponent } from '../components/generate/generate.component';
import { GenerateProductsComponent } from '../components/generate/children/generate-products/generate-products.component';
import { GenerateDataComponent } from '../components/generate/children/generate-data/generate-data.component';
import { SettingsComponent } from '../pages/settings/settings.component';
import { QuotationDetailComponent } from '../pages/quotation-detail/quotation-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  {
    path: 'panel', component: PanelComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'generate', pathMatch: 'full' },
      { path: 'search-quotation', component: SearchQuotationsComponent, canActivate: [AdminGuard] },
      { path: 'user-quotations', component: UserQuotationsComponent },
      { path: 'quotation-detail/:id', component: QuotationDetailComponent },
      { path: 'user', component: UserComponent },
      { path: 'settings', component: SettingsComponent },
      {
        path: 'generate',
        component: GenerateComponent,
        children: [
          { path: '', redirectTo: 'generate-products', pathMatch: 'full' },
          { path: 'generate-products', component: GenerateProductsComponent },
          { path: 'generate-data', component: GenerateDataComponent },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
