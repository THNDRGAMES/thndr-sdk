import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameViewerPageRoutingModule } from './game-viewer-routing.module';
import { GameViewerPage } from './game-viewer.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, GameViewerPageRoutingModule],
  declarations: [GameViewerPage],
})
export class GameViewerPageModule {}
