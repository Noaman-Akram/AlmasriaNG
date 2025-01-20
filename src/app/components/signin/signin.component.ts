import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  isLoading:boolean =false
  errMsg:string=''

loginForm:FormGroup = new FormGroup({
  email : new FormControl(null,[Validators.required,Validators.email]),
  password : new FormControl(null,[Validators.required,Validators.pattern(/^[A-Z][a-z0-9]{6}$/)]),
})
}
