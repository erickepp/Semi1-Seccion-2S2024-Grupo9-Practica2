import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-reconocimiento',
  templateUrl: './reconocimiento.page.html',
  styleUrls: ['./reconocimiento.page.scss'],
})
export class ReconocimientoPage implements OnInit {

  public sourceFile: any;
  public picImage: any;
  public activado: boolean = true;
  public pass: string = "";
  public confirmpass: string = "";
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
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  registrar() {
    let usuarioForm = new FormData();
    if(this.activado) {
      usuarioForm.append("image_key",this.sourceFile);
    }
    
    if(this.activado) {
      usuarioForm.append("status","1");
    } else {
      usuarioForm.append("status","0");
    }
    
    usuarioForm.append("password",this.pass);


    this.http.patch(this.appC.urlC + '/users/' + this.dataUser.user_id + '/facial-recognition', usuarioForm, {
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
