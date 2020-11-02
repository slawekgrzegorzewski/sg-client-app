import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[appAppCurrencyAutocompletion]'
})
export class AppCurrencyAutocompletionDirective implements OnInit {


  constructor(private el: ElementRef<HTMLInputElement>) {
  }

  ngOnInit(): void {

  }

}
