import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public usuario: string = "";
  public correo: string = "";
  public pass: string = "";
  public confirmpass: string = "";

  constructor(
    private router: Router
    , public appC: AppComponent
    , public http: HttpClient
  ) { }

  ngOnInit() {
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  registrar(){
    let usuarioForm = new FormData();
    usuarioForm.append("image",this.sourceFile);
    usuarioForm.append("username",this.usuario);
    usuarioForm.append("email",this.correo);
    usuarioForm.append("password",this.pass);
    usuarioForm.append("confirm_password",this.confirmpass);


    this.http.post(this.appC.urlC + '/users', usuarioForm, {
      headers: new HttpHeaders({
        'enctype':'multipart/form-data'
      })
    })
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
    //
  }

  regresar() {
    this.router.navigate(['/login']);
  }
}
 