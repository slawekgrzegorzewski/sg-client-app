import {Component, OnInit} from '@angular/core';
import {PageVersionsService} from '../../../services/checker/page-versions.service';
import {PageVersion} from '../../../model/checker/page-version';

@Component({
  selector: 'app-checker-home',
  templateUrl: './checker-home.component.html',
  styleUrls: ['./checker-home.component.css']
})
export class CheckerHomeComponent implements OnInit {

  versions: PageVersion[] = [];
  selectedVersion: PageVersion | null = null;

  constructor(private pageVersionsService: PageVersionsService) {
  }

  ngOnInit(): void {
    this.pageVersionsService.getAllPageVersions().subscribe(data => {
      this.versions = data.sort((a, b) => a.versionTime.getMilliseconds() - b.versionTime.getMilliseconds());
    });
  }

  switchSelection(version: PageVersion): void {
    if (this.selectedVersion && this.selectedVersion === version) {
      this.selectedVersion = null;
    } else {
      this.selectedVersion = version;
    }
  }

  shouldShow(version: PageVersion): boolean {
    if (!this.selectedVersion) {
      return false;
    }
    return this.selectedVersion.id === version.id;
  }
}
