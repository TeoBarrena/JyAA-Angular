import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './layout/notificaciones/toast-container/toast-container.component';
import { AuthService } from './auth/auth-service/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'JyAA';

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.checkSession().subscribe();
  }
}
