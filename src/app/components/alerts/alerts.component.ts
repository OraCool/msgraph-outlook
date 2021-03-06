import { Component, OnInit } from '@angular/core';
import { AlertsService } from 'src/app/services/alerts.service';
import { Alert } from 'src/app/models/alert';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  constructor(private alertsService: AlertsService) {}

  ngOnInit() {}

  close(alert: Alert) {
    this.alertsService.remove(alert);
  }
}
