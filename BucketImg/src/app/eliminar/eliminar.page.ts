import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-eliminar',
  templateUrl: './eliminar.page.html',
  styleUrls: ['./eliminar.page.scss'],
})
export class EliminarPage implements OnInit {

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
  }

  registrar() {
    this.http.delete(this.appC.urlC + '/users/'  + this.dataUser.user_id, { body: {
      password: this.pass
    }})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.router.navigate(['/login']);
    }, error => {
      console.log(error);
    });
  }

  regresar() {
    this.router.navigate(['/configuracion'], this.dataUser);
  }

}
