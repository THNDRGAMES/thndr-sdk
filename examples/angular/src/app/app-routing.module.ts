import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PAGE } from './routes';

const routes: Routes = [
  {
    path: PAGE.HOME,
    loadChildren: () => import('./features/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: `${PAGE.GAME_VIEWER}/:gameId`,
    loadChildren: () =>
      import('./features/game-viewer/game-viewer.module').then((m) => m.GameViewerPageModule),
  },
  {
    path: '',
    redirectTo: PAGE.HOME,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
