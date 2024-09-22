import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.page.html',
  styleUrls: ['./informacion.page.scss'],
})
export class InformacionPage implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public usuario: string = "";
  public correo: string = "";
  public pass: string = "";
  dataUser: any;

  constructor(
    private router: Router
    , public appC: AppComponent
    , public http: HttpClient
    , private activatedRoute: ActivatedRoute
  ) { 
    this.activatedRoute.queryParams.subscribe(async params => {
      this.dataUser = params;
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  cargarDatos() {
    this.http.get(this.appC.urlC + '/users/' + this.dataUser.user_id , {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.picImage = jsonData["image"];
      this.usuario = jsonData["username"];
      this.correo = jsonData["email"];
    }, error => {
      console.log(error);
    });
  }

  registrar() {
    let usuarioForm = new FormData();
    if(this.sourceFile) {
      usuarioForm.append("image",this.sourceFile);
    }
    if(this.dataUser.username !== this.usuario) {
      usuarioForm.append("username",this.usuario);
    }
    if(this.dataUser.email !== this.correo) {
      usuarioForm.append("email",this.correo);
    }
    usuarioForm.append("password",this.pass);


    this.http.patch(this.appC.urlC + '/users/'  + this.dataUser.user_id  , usuarioForm, {
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
  }

  regresar() {
    this.router.navigate(['/configuracion'], {queryParams: this.dataUser});
  }

}
