import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-extraer',
  templateUrl: './extraer.page.html',
  styleUrls: ['./extraer.page.scss'],
})
export class ExtraerPage implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public textoExtraido: string = "";
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
    usuarioForm.append("image",this.sourceFile);


    this.http.post(this.appC.urlC + '/images/text', usuarioForm, {
      headers: new HttpHeaders({
        'enctype':'multipart/form-data'
      })
    })
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData.text);
      this.textoExtraido = jsonData.text;
    }, error => {
      console.log(error);
    });
  }

  regresar() {
    this.router.navigate(['/home'], {queryParams: this.dataUser});
  }

}
