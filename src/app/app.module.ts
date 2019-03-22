import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HomeComponent } from './components/home/home.component';
import { AlertsComponent } from './components/alerts/alerts.component';
library.add(faExternalLinkAlt);
library.add(faUserCircle);
import { MsalModule } from '@azure/msal-angular';
import { OAuthSettings } from '../oauth';
import { CalendarComponent } from './components/calendar/calendar.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, NavBarComponent, HomeComponent, AlertsComponent, CalendarComponent],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    MsalModule.forRoot({
      clientID: OAuthSettings.appId
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
