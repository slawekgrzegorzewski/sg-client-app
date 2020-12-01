import {Component, OnInit} from '@angular/core';
import {PiggyBank} from '../../model/piggy-bank';
import {PiggyBanksService} from '../../services/piggy-banks.service';

@Component({
  selector: 'app-piggy-banks-small',
  templateUrl: './piggy-banks-small.component.html',
  styleUrls: ['./piggy-banks-small.component.css']
})
export class PiggyBanksSmallComponent implements OnInit {

  piggyBanks: PiggyBank[];

  constructor(private piggyBanksService: PiggyBanksService
  ) {
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.fetchPiggyBanks();
  }

  private fetchPiggyBanks(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(data => {
      this.piggyBanks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }


  updatePiggyBank(piggyBank: PiggyBank): void {
    this.piggyBanksService.update(piggyBank)
      .subscribe(
        success => this.refreshData(),
        error => this.refreshData()
      );
  }

}
