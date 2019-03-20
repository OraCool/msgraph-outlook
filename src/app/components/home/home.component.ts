import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Is a user logged in?
  authenticated: boolean;
  // The user
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authenticated = false;
    this.user = {};
  }

  async signIn(): Promise<void> {
    await this.authService.signIn();

    // Temporary to display the token
    /* if (this.authService.authenticated) {
      const token = await this.authService.getAccessToken();
    } */
  }
}
