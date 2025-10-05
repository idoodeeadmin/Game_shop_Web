import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { Login } from './login/login';
import { Home } from './home/home';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: 'home', component: Home},
  { path: 'profile', component: ProfileComponent }
];
