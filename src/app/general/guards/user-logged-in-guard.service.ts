import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {LoginService} from 'src/app/general/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class UserLoggedInGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.loginService.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
