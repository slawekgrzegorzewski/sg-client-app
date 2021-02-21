import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Category} from '../../../model/accountant/billings/category';
import {Client} from '../../../model/accountant/client';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  @Input() clients: Client[] = [];
  @Output() createEvent = new EventEmitter<Client>();
  @Output() updateEvent = new EventEmitter<Client>();
  editElement: Client;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: Client;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor() {
  }

  ngOnInit(): void {
  }

  setOverAccount(client: Client, row: HTMLDivElement): void {
    this.overElement = client;
    if (client) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): Client {
    const acc = this.overElement;
    this.setOverAccount(null, null);
    return acc;
  }

  prepareToEdit(): void {
    this.editElement = this.overElement;
  }

  prepareToCreate(): void {
    this.editElement = new Category();
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
