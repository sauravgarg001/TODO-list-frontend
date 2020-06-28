import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: string;
  public lastName: string;
  public mobileNumber: string;
  public email: string;
  public password: string;

  constructor(public appService: AppService, public router: Router) { }

  ngOnInit(): void {
  }

  public signup(): void {
    let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobileNumber,
      email: this.email,
      password: this.password
    }

    this.appService.signup(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          alert(apiResponse.message);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public validateEmail(email: string): boolean {
    let patt = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (patt.test(email)) {
      return true;
    } else {
      return false;
    }
  }

  public validateMobile(mobileNumber: string): boolean {
    let patt = /^[6-9]\d{9}$/;
    if (patt.test(mobileNumber)) {
      return true;
    } else {
      return false;
    }
  }

  public validatePassword(password: string): boolean {
    let patt = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (patt.test(password)) {
      return true;
    } else {
      return false;
    }
  }

}
