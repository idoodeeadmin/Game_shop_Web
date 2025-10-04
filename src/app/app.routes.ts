import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { Login } from './login/login';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: 'home', component: Home}
];
