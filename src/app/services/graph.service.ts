import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';

import { AuthService } from './auth.service';
import { Event } from '../models/event';
import { AlertsService } from './alerts.service';
import { isEmpty } from 'lodash';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private graphClient: Client;
  public events: Observable<Event[]>;

  constructor(
    private authService: AuthService,
    private alertsService: AlertsService
  ) {
    // Initialize the Graph client
    this.graphClient = Client.init({
      authProvider: async done => {
        // Get the token from the auth service
        const token = await this.authService.getAccessToken().catch(reason => {
          done(reason, null);
        });

        if (token) {
          done(null, token);
        } else {
          done('Could not get an access token', null);
        }
      }
    });
  }

  getEventsRx(filter?: string): Observable<Event[]> {
    try {
      let query = this.graphClient
        .api('/me/events');
      query = !isEmpty(filter) ? query.filter(`contains(subject, '${filter}')`) : query;
      const result = query.select('subject,organizer,start,end,type')
        .orderby('createdDateTime DESC')
        .get();
      const request = from<Event[]>(result).pipe(
        map(response => response)
      );
      return request;
    } catch (error) {
      this.alertsService.add(
        'Could not get events',
        JSON.stringify(error, null, 2)
      );
    }
  }
  async getEvents(filterString: string): Promise<Event[]> {
    try {
      let query = this.graphClient
        .api('/me/events');
      query = !isEmpty(filterString) ? query.filter(`contains(subject, '${filterString}')`) : query;
      const result = await query.select('subject,organizer,start,end,type')
        .orderby('createdDateTime DESC')
        .get();

      return result.value;
    } catch (error) {
      this.alertsService.add(
        'Could not get events',
        JSON.stringify(error, null, 2)
      );
    }
  }
}
