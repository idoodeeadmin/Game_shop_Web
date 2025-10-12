 // app.routes.ts หรือ app-routing.module.ts
import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { Login } from './login/login';
import { Home } from './home/home';
import { ProfileComponent } from './profile/profile';
import { AuthGuard } from './authguard';
import { DashboardComponent } from './dashboard/dashboard';
import { Add } from './add/add';
import { Edit } from './edit/edit';
import { Cart } from './cart/cart';
import { UserInventoryComponent } from './inventory/inventory';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },

  // ✅ Protected routes
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add', component: Add, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: Edit, canActivate: [AuthGuard] },
  {path: 'cart', component: Cart, canActivate: [AuthGuard]},
  {path: 'inventory', component: UserInventoryComponent, canActivate: [AuthGuard]}
];
