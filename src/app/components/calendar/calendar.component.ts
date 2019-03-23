import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';

import { GraphService } from '../../services/graph.service';
import { Event, DateTimeTimeZone } from '../../models/event';
import { AlertsService } from '../../services/alerts.service';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  tap,
  switchMap
} from 'rxjs/operators';
import {
  NgbCalendar,
  NgbDateStruct,
  NgbDate
} from '@ng-bootstrap/ng-bootstrap';
import { ngbDateToDate } from 'src/app/shared/helpers/dateFormater';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  private events: Event[];
  filterString: string;

  searching = false;
  searchFailed = false;

  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;
  excludeString: string;

  constructor(
    private graphService: GraphService,
    private alertsService: AlertsService,
    private calendar: NgbCalendar
  ) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {}

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  formatDateTimeTimeZone(dateTime: DateTimeTimeZone): string {
    try {
      return moment.tz(dateTime.dateTime, dateTime.timeZone).format();
    } catch (error) {
      this.alertsService.add(
        'DateTimeTimeZone conversion error',
        JSON.stringify(error)
      );
    }
  }
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap(term =>
        this.graphService.getEventsRx(term).pipe(
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );
  runSearch() {
    this.graphService
      .getCalendarEvents({
        subjectInclude: this.filterString,
        subjectExclude: this.excludeString,
        fromDate: ngbDateToDate(this.fromDate),
        toDate: ngbDateToDate(this.toDate)
      })
      .then(events => {
        this.events = events;
      });
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      date.equals(this.toDate) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
}
