import {Inject, Injectable, LOCALE_ID} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(@Inject(LOCALE_ID) private defaultLocale: string) {
  }

  public getUsersLocale(): string {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return this.defaultLocale;
    }
    const wn = window.navigator as any;
    let lang = wn.languages ? wn.languages[0] : this.defaultLocale;
    lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;
    return lang;
  }
}
