import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-subir',
  templateUrl: './subir.page.html',
  styleUrls: ['./subir.page.scss'],
})
export class SubirPage implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public nombre: string = "";
  public descripcion: string = "";
  public albumes: any[] = [];
  public idAlbum: string = "";
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
    this.obtenerAlbumes();
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  obtenerAlbumes() {
    this.http.get(this.appC.urlC + '/users/' + this.dataUser.user_id + '/albums' , {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.albumes = jsonData.albums;
    }, error => {
      console.log(error);
    });
  }

  subir() {
    let usuarioForm = new FormData();
    usuarioForm.append("url",this.sourceFile);
    usuarioForm.append("name",this.nombre);
    usuarioForm.append("description",this.descripcion);
    usuarioForm.append("album_id",this.idAlbum);


    this.http.post(this.appC.urlC + '/images', usuarioForm, {
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
    this.router.navigate(['/home'], {queryParams: this.dataUser});
  }

}
