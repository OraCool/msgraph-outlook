import { NgbDate } from "@ng-bootstrap/ng-bootstrap";

export const ngbDateToDate = (date: NgbDate) => new Date(date.year, date.month, date.day);
