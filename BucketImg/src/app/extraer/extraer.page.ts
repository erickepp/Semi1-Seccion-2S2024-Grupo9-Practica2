import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-extraer',
  templateUrl: './extraer.page.html',
  styleUrls: ['./extraer.page.scss'],
})
export class ExtraerPage implements OnInit {

  public sourceFile: any;
  public picImage:any;
  public textoExtraido: string = "ESTE ES EL TEXTO QUE SE LOGRO EXTRAER DE LA IMAGEN";

  constructor(
    private router: Router
    , public appC: AppComponent
  ) { }

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

  }

  regresar() {
    this.router.navigate(['/home']);
  }

}
