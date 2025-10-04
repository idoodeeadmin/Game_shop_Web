import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true, // 🔑 ต้อง standalone ถ้าไม่มี AppModule
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'] // ✅ แก้เป็น styleUrls
})
export class App {
  protected readonly title = signal('game_finalweb');
}
