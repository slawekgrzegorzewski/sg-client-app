import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDate, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Component, forwardRef, Input} from '@angular/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DataPickerComponent), multi: true}
  ]
})
export class DataPickerComponent implements ControlValueAccessor {

  @Input() id: string = 'datePickerId';

  private dataInternal: NgbDateStruct | null = null;

  get data(): NgbDateStruct | null {
    return this.dataInternal;
  }

  set data(value: NgbDateStruct | null) {
    function convertToDate(date: NgbDateStruct): Date {
      return new Date(`${date.year}-${date.month}-${date.day} 12:00:00`);
    }

    this.dataInternal = value;
    const dateValue = convertToDate(this.dataInternal!);
    this.propagateChange(dateValue);
    this.propagateTouched(dateValue);
  }

  propagateChange: (_: Date) => void = (d: Date) => {
  };
  propagateTouched: (_: Date) => void = (d: Date) => {
  };
  @Input() disabled: boolean = false;

  registerOnChange(fn: (_: Date) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: Date) => void): void {
    this.propagateTouched = fn;
  }

  writeValue(obj: Date): void {
    if (!obj) {
      return;
    }
    this.dataInternal = new NgbDate(
      obj.getFullYear(),
      obj.getMonth() + 1,
      obj.getDate());
  }

}
