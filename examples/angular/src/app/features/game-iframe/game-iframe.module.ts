import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameIframePageRoutingModule } from './game-iframe-routing.module';
import { GameIframePage } from './game-iframe.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, GameIframePageRoutingModule],
  declarations: [GameIframePage],
})
export class GameIframePageModule {}
