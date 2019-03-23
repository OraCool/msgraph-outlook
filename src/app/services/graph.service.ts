import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';

import { AuthService } from './auth.service';
import { Event } from '../models/event';
import { AlertsService } from './alerts.service';
import { isEmpty } from 'lodash';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Filter } from '../models/filter';

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
      let query = this.graphClient.api('/me/events');
      query = !isEmpty(filter)
        ? query.filter(`contains(subject, '${filter}')`)
        : query;
      const result = query
        .select('subject,organizer,start,end,type')
        .orderby('createdDateTime DESC')
        .get();
      const request = from<Event[]>(result).pipe(map(response => response));
      return request;
    } catch (error) {
      this.alertsService.add(
        'Could not get events',
        JSON.stringify(error, null, 2)
      );
    }
  }
  async getEvents(filter: Filter): Promise<Event[]> {
    try {
      let query = this.graphClient.api('/me/events');
      const filterString = this.buildFilter(filter);
      query = !isEmpty(filterString) ? query.filter(filterString) : query;
      const result = await query
        .select('subject,organizer,start,end,type')
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
  async getCalendarEvents(filter: Filter): Promise<Event[]> {
    try {
      let query = this.graphClient.api('/me/calendarview');
      query = !isEmpty(filter.subjectInclude)
        ? query.filter(`contains(subject, '${filter.subjectInclude}')`)
        : query;

      const result = await query
        .query({
          startdatetime: filter.fromDate.toISOString(),
          enddatetime: filter.toDate.toISOString()
        })
        .top(10000)
        .select('subject,organizer,start,end,type')
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
  buildFilter = (filter: Filter): string => {
    let filterString = '';
    filterString = !isEmpty(filter.subjectInclude)
      ? `contains(subject, '${filter.subjectInclude}')`
      : filterString;
    /* if (!isEmpty(filter.subjectExclude)) {
      filterString = !isEmpty(filterString)
        ? filterString + ' and '
        : filterString;
      filterString = filterString + `not(contains(subject, '${filter.subjectExclude}'))`;
    } */
    if (filter.fromDate) {
      filterString = !isEmpty(filterString)
        ? filterString + ' and '
        : filterString;
      filterString =
        filterString + `start/dateTime ge '${filter.fromDate.toISOString()}'`;
    }
    if (filter.toDate) {
      filterString = !isEmpty(filterString)
        ? filterString + ' and '
        : filterString;
      filterString =
        filterString + `end/dateTime le '${filter.toDate.toISOString()}'`;
    }
    return filterString;
  };
  // https://graph.microsoft.com/v1.0/me/events/AQMkADAwATZiZmYAZC05ODZiLTA5ZDctMDACLTAwCgBGAAADXnedbcGClkyLDkhWPnNzAMYHAJ0tPlJ3foxJi9jmyjbdx14AAAIBDQAAAJ0tPlJ3foxJi9jmyjbdx14AAZ-9-QAvAAAA/instances?startDateTime=2015-11-08T19:00:00.0000000&endDateTime=2019-11-08T19:00:00.0000000

  //https://graph.microsoft.com/v1.0/me/events?$select=subject,organizer,start,end,type&$orderby=createdDateTime%20DESC

  //https://graph.microsoft.com/v1.0/me/events?$filter=startDateTime ge 2015-11-08T19:00:00.0000000&$select=subject,organizer,start,end,type&$orderby=createdDateTime%20DESC
}
