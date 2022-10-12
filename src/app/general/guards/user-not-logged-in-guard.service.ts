import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {LoginService} from 'src/app/general/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class UserNotLoggedInGuard implements CanActivate {
  constructor(private loginService: LoginService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !this.loginService.isLoggedIn();
  }

}
