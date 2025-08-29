import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, Route, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Injectable()
export class AdminAuthGuard   {
    constructor(
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        localStorage.setItem("routeName",  JSON.stringify(route.routeConfig?.path));
        

        let token: any = localStorage.getItem("token");
        // user = JSON.parse(user);

         
        //return false;
        if (token) {
            return true;    
        }
        this.router.navigate(['/login']);
            // authorised so return true
        return false;
        
    }

}
