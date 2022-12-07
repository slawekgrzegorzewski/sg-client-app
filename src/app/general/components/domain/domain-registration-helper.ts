import {EventEmitter} from '@angular/core';
import {DomainService} from '../../services/domain.service';
import {NgEventBus} from 'ng-event-bus';
import {SELECTED_DOMAIN_CHANGED} from '../../utils/event-bus-events';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

export class DomainRegistrationHelper {

  domainSubscription: Subscription | null = null;
  domainChangedEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private domainService: DomainService,
              private eventBus: NgEventBus,
              private route: ActivatedRoute,
              private routerUrl: string) {
    this.domainService.registerToDomainChangesViaRouterUrl(routerUrl, this.route);
    this.domainSubscription = this.eventBus.on(SELECTED_DOMAIN_CHANGED).subscribe(() => {
      this.domainChangedEvent.emit();
    });
  }

  onDestroy() {
    if (this.domainSubscription) {
      this.domainSubscription.unsubscribe();
      this.domainSubscription = null;
    }
    this.domainService.deregisterFromDomainChangesViaRouterUrl(this.routerUrl);
  }
}
