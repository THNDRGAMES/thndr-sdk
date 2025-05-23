import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PAGE } from './routes';

const routes: Routes = [
  {
    path: PAGE.HOME,
    loadChildren: () => import('./features/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: `${PAGE.GAME_IFRAME}/:gameId`,
    loadChildren: () =>
      import('./features/game-iframe/game-iframe.module').then((m) => m.GameIframePageModule),
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
