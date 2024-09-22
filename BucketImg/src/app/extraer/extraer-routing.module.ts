import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExtraerPage } from './extraer.page';

const routes: Routes = [
  {
    path: '',
    component: ExtraerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtraerPageRoutingModule {}
