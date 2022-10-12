import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Client} from '../../model/client';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  @Input() clients: Client[] = [];
  @Output() createEvent = new EventEmitter<Client>();
  @Output() updateEvent = new EventEmitter<Client>();
  editElement: Client | null = null;

  @ViewChild('utilBox') utilBox: ElementRef | null = null;
  overElement: Client | null = null;
  utilBoxTop: number = 0;
  utilBoxLeft: number = 0;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(client: Client | null, row: HTMLDivElement | null): void {
    this.overElement = client;
    if (client && row) {
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
    this.editElement = new Client();
  }

  reset(): void {
    this.editElement = null;
    this.setOverAccount(null, null);
  }

  create(): void {
    if(this.editElement) {
      this.createEvent.emit(this.editElement);
      this.reset();
    }
  }

  update(): void {
    if(this.editElement) {
      this.updateEvent.emit(this.editElement);
      this.reset();
    }
  }
}
