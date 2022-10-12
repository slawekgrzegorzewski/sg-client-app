import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Domain} from '../../model/domain';


@Component({
  selector: 'app-domain-invitations',
  templateUrl: './domain-invitations.component.html',
  styleUrls: ['./domain-invitations.component.css']
})
export class DomainInvitationsComponent<T> implements OnInit {

  constructor() {
  }

  @Input() invitations: Domain[] = [];
  @Output() acceptInvitationEvent = new EventEmitter<Domain>();
  @Output() rejectInvitationEvent = new EventEmitter<Domain>();

  ngOnInit(): void {
  }

  acceptInvitation(domainId: number): void {
    this.acceptInvitationEvent.emit(this.invitations.find(d => d.id === domainId));
  }

  rejectInvitation(domainId: number): void {
    this.rejectInvitationEvent.emit(this.invitations.find(d => d.id === domainId));
  }
}
