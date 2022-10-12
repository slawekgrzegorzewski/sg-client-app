import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Service} from '../../model/service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  @Input() services: Service[] = [];
  @Output() createEvent = new EventEmitter<Service>();
  @Output() updateEvent = new EventEmitter<Service>();
  overElement: Service | null = null;
  editElement: Service | null = null;

  @ViewChild('utilBox') utilBox: ElementRef | null = null;
  utilBoxTop: number = 0;
  utilBoxLeft: number = 0;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(service: Service | null, row: HTMLDivElement | null): void {
    this.overElement = service;
    if (service && row) {
      const adjustment = (row.offsetHeight - this.utilBox!.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox!.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
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
    if (this.editElement) {
      this.createEvent.emit(this.editElement);
    }
    this.reset();
  }

  update(): void {
    if (this.editElement) {
      this.updateEvent.emit(this.editElement);
    }
    this.reset();
  }
}
