import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-face',
  templateUrl: './modal-face.component.html',
  styleUrls: ['./modal-face.component.scss'],
})
export class ModalFaceComponent  implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public correo: string = "";

  constructor(
    public http: HttpClient
    , private router: Router
    , private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  
  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  reconocimiento() {
    let usuarioForm = new FormData();
    usuarioForm.append("image",this.sourceFile);
    usuarioForm.append("username_or_email",this.correo);

    console.log(this.sourceFile);
    console.log(this.correo);

    this.http.post('http://127.0.0.1:5000/login/facial-recognition', usuarioForm, {
      headers: new HttpHeaders({
        'enctype':'multipart/form-data'
      })
    })
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.router.navigate(['/home'], {queryParams: jsonData});
      this.modalCtrl.dismiss(null, 'confirm');
    }, error => {
      console.log(error);
    });
  }
}
