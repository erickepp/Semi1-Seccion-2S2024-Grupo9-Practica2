import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReconocimientoPage } from './reconocimiento.page';

const routes: Routes = [
  {
    path: '',
    component: ReconocimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReconocimientoPageRoutingModule {}
