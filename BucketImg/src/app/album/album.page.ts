import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { ModalImgComponent } from '../modal-img/modal-img.component';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-album',
  templateUrl: './album.page.html',
  styleUrls: ['./album.page.scss'],
})
export class AlbumPage implements OnInit {
  
  public pass: string = "";
  public albumes: any[] = [];
  dataUser: any;

  constructor(
    private router: Router
    , public appC: AppComponent
    , private modalCtrl: ModalController
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

  registrar() {

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

  async openModal(idImagen: string) {
    const modal = await this.modalCtrl.create({
      component: ModalImgComponent,
      componentProps: { 
        codigo: idImagen
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }
}
