import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ModalFaceComponent } from '../modal-face/modal-face.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public correo: string = "";
  public pass: string = "";
  public mensaje: string = "";

  constructor(
    private router: Router
    , public appC: AppComponent
    , public http: HttpClient
    , private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  irInicio(){
    this.http.post(this.appC.urlC + '/login', {username_or_email: this.correo, password: this.pass}, {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      this.mensaje = jsonData['message'];
      this.router.navigate(['/home'], {queryParams: jsonData})
    }, error => {
      console.log(error);
      this.mensaje = "Hubo un error al ingresar";
    });
  }

  irRegistro(){
    this.router.navigate(['/registro'])
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalFaceComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }
}
