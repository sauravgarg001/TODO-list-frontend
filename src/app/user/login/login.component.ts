import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;

  constructor(public appService: AppService, public router: Router) { }

  ngOnInit(): void {
    if (Cookie.get('authToken') && Cookie.get('userId'))
      this.router.navigate(['/dashboard']);
  }

  public login(): void {
    let data = {
      email: this.email,
      password: this.password
    }
    this.appService.login(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {

          Cookie.set('authToken', apiResponse.data.authToken);
          Cookie.set('userId', apiResponse.data.userId);

          this.appService.setUserInfoInLocalStorage(apiResponse.data);
          this.router.navigate(['/dashboard']);
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      }
    )
  }

  public validateEmail(email: string): boolean {
    let patt = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (patt.test(email)) {
      return true;
    } else {
      return false;
    }
  }
}
