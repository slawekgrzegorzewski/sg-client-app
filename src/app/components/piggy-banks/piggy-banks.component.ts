import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ToastService} from '../../services/toast.service';
import {PiggyBank} from '../../model/piggy-bank';
import {PiggyBanksService} from '../../services/piggy-banks.service';

export const INCOME = 'income';
export const EXPENSE = 'expense';

@Component({
  selector: 'app-piggy-banks',
  templateUrl: './piggy-banks.component.html',
  styleUrls: ['./piggy-banks.component.css']
})
export class PiggyBanksComponent implements OnInit {

  piggyBanks: PiggyBank[] = [];
  editElement: PiggyBank;

  @ViewChild('utilBox') utilBox: ElementRef;
  overElement: PiggyBank;
  utilBoxTop: number;
  utilBoxLeft: number;
  utilBoxVisibility = 'hidden';

  constructor(
    private piggyBanksService: PiggyBanksService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData(): void {
    this.piggyBanksService.getAllPiggyBanks().subscribe(
      data => this.piggyBanks = data,
      error => this.toastService.showWarning('Could not obtain piggy banks ' + error)
    );
  }

  setOverPiggyBank(piggyBank: PiggyBank, row: HTMLDivElement): void {
    this.overElement = piggyBank;
    if (piggyBank) {
      const adjustment = (row.offsetHeight - this.utilBox.nativeElement.offsetHeight) / 2;
      this.utilBoxTop = row.getBoundingClientRect().top + adjustment;
      this.utilBoxLeft = row.getBoundingClientRect().left + row.clientWidth - this.utilBox.nativeElement.offsetWidth;
      this.utilBoxVisibility = 'visible';
    } else {
      this.utilBoxVisibility = 'hidden';
    }
  }

  buttonClicked(): PiggyBank {
    const acc = this.overElement;
    this.setOverPiggyBank(null, null);
    return acc;
  }

  prepareToEdit(): void {
    this.editElement = this.overElement;
  }

  prepareToCreate(): void {
    this.editElement = new PiggyBank();
  }

  reset(): void {
    this.editElement = null;
    this.setOverPiggyBank(null, null);
  }

  create(): void {
    this.piggyBanksService.create(this.editElement).subscribe(
      data => {
        this.fetchData();
        this.reset();
      },
      error => {
        this.toastService.showWarning('Can not create new piggy bank ' + error);
        this.reset();
      }
    );
  }

  update(): void {
    this.piggyBanksService.update(this.editElement).subscribe(
      data => {
        this.reset();
      },
      error => {
        this.toastService.showWarning('Can not update piggy bank ' + error);
        this.reset();
      }
    );
  }
}
