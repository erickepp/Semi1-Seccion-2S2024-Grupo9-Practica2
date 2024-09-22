import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReconocimientoPageRoutingModule } from './reconocimiento-routing.module';

import { ReconocimientoPage } from './reconocimiento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReconocimientoPageRoutingModule
  ],
  declarations: [ReconocimientoPage]
})
export class ReconocimientoPageModule {}
