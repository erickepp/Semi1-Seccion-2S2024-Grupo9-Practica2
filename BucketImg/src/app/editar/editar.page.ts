import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {

  public nameAlbum: string = "";
  public newNameAlbum: string = "";
  public albumes: any[] = [];
  public idEliminarAlbum: string = "";
  public idEditarAlbum: string = "";
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

  crear() {
    this.http.post(this.appC.urlC + '/albums', {name: this.nameAlbum, user_id: this.dataUser.user_id}, {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      this.obtenerAlbumes();
    }, error => {
      console.log(error);
    });
  }

  modificar() {
    this.http.patch(this.appC.urlC + '/albums/'  + this.idEditarAlbum, 
      {name: this.newNameAlbum}, {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      this.obtenerAlbumes();
    }, error => {
      console.log(error);
    });
  }

  eliminar() {
    this.http.delete(this.appC.urlC + '/albums/'  + this.idEliminarAlbum)
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      this.obtenerAlbumes();
    }, error => {
      console.log(error);
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

  regresar() {
    this.router.navigate(['/home'], {queryParams: this.dataUser});
  }

}
