import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExtraerPageRoutingModule } from './extraer-routing.module';

import { ExtraerPage } from './extraer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExtraerPageRoutingModule
  ],
  declarations: [ExtraerPage]
})
export class ExtraerPageModule {}
