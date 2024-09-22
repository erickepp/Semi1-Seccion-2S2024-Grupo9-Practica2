import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-img',
  templateUrl: './modal-img.component.html',
  styleUrls: ['./modal-img.component.scss'],
})
export class ModalImgComponent  implements OnInit {

  @Input() codigo: string = "";

  public tituloImg: string = "";
  public picImage: string = "";
  public descripcion: string = "";
  public traduccion: string = "";
  public etiquetas: string[] = [];
  public traducciones: any[] = [];
  public idIdioma: string = "0";

  constructor(
    private modalController: ModalController
    , public http: HttpClient
  ) { }

  ngOnInit() { this.obtenerImagen(); }

  obtenerImagen() {
    this.http.get('http://127.0.0.1:5000/images/' + this.codigo , {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);

      this.http.get('http://127.0.0.1:5000//images/'+ this.codigo + '/labels', {})
      .subscribe(dataEtiquetas => {
        let jsonDataEtiquetas = JSON.parse(JSON.stringify(dataEtiquetas));
        console.log(jsonDataEtiquetas.labels);

        this.etiquetas = jsonDataEtiquetas.labels;

        this.http.get('http://127.0.0.1:5000//images/'+ this.codigo + '/translate', {})
        .subscribe(dataDescripcion => {
          let jsonDataDescripcion = JSON.parse(JSON.stringify(dataDescripcion));
          console.log(jsonDataDescripcion.translations);

          this.traducciones = jsonDataDescripcion.translations;
          this.tituloImg = jsonData.name;
          this.picImage = jsonData.url;
          this.descripcion = jsonData.description;
          this.traduccion = jsonData.description;


        }
        ,
        error => {

        }
      );

        
      }
      , error => {

      }
    );

      
    }, error => {
      console.log(error);
    });
  }

  handleChange(e: any) {

    if(e.detail.value == 1) {
      this.traduccion = this.traducciones[0].description;
    }

    if(e.detail.value == 2) {
      this.traduccion = this.traducciones[1].description;
    }

    if(e.detail.value == 3) {
      this.traduccion = this.traducciones[2].description;
    }

  }

}
