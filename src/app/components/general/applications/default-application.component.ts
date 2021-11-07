import {Component, OnInit} from '@angular/core';
import {ApplicationsService} from '../../../services/applications.service';

export type EditMode = 'edit' | 'create' | 'invite' | '';

@Component({
  selector: 'app-default-application',
  templateUrl: './default-application.component.html',
  styleUrls: ['./default-application.component.css']
})
export class DefaultApplicationComponent implements OnInit {

  constructor(
    private applicationsService: ApplicationsService
  ) {
  }

  ngOnInit(): void {
    this.applicationsService.selectFirstAvailableApp();
  }
}
