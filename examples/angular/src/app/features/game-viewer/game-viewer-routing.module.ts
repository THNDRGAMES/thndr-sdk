import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameViewerPage } from './game-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: GameViewerPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameViewerPageRoutingModule {}
