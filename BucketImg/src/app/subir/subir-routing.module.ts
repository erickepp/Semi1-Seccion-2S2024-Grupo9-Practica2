import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubirPage } from './subir.page';

const routes: Routes = [
  {
    path: '',
    component: SubirPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubirPageRoutingModule {}
