import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Service} from '../../../model/accountant/service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  @Input() services: Service[] = [];
  @Output() createEvent = new EventEmitter<Service>();
  @Output() updateEvent = new EventEmitter<Service>();
  editElement: Service;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Service;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(service: Service, row: HTMLDivElement): void {
    this.overElement = service;
    if (service) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): Service {
    const acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }

  prepareToEdit(): void {
    this.editElement = this.overElement;
  }

  prepareToCreate(): void {
    this.editElement = new Service();
  }

  reset(): void {
    this.editElement = null;
    this.setOverAccount(null, null);
  }

  create(): void {
    this.createEvent.emit(this.editElement);
    this.reset();
  }

  update(): void {
    this.updateEvent.emit(this.editElement);
    this.reset();
  }
}
