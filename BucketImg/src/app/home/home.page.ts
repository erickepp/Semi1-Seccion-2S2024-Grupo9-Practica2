import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public picImage: string = "";
  public usuario: string = "";
  public correo: string = "";
  dataUser: any;

  constructor(
    private router: Router
    , public appC: AppComponent
    , private activatedRoute: ActivatedRoute
  ) {

    this.activatedRoute.queryParams.subscribe(async params => {
      this.dataUser = params;
      this.usuario = this.dataUser.username;
      this.correo = this.dataUser.email;
      this.picImage = this.dataUser.image;
    });

  }


  irPantalla(pantalla: string) {
    this.router.navigate([pantalla], {queryParams: this.dataUser});
  }

}
