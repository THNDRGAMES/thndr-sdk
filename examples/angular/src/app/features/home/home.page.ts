import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GameId } from 'src/app/common/model/game-id';
import { WidgetBrowserService } from 'src/app/core/services/widget-browser/widget-browser.service';
import { PAGE } from 'src/app/routes';

interface GameMetadata {
  id: GameId;
  label: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private widgetBrowserService = inject(WidgetBrowserService);
  private router = inject(Router);

  gameClicked = false;
  gamesList: GameMetadata[];

  constructor() {
    this.gamesList = [
      {
        id: GameId.Blackjack,
        label: 'Blackjack',
      },
      {
        id: GameId.Blocks,
        label: 'Blocks',
      },
      {
        id: GameId.Solitaire,
        label: 'Solitaire',
      },
    ];
  }

  async onGameClick(gameId: string): Promise<void> {
    if (this.gameClicked) {
      return;
    }
    this.gameClicked = true;

    if (Capacitor.isNativePlatform()) {
      await this.widgetBrowserService.startWidget(gameId as GameId, () => {
        this.gameClicked = false;
      });
      return;
    }

    await this.router.navigate([`${PAGE.GAME_VIEWER}/${gameId}`]);
    this.gameClicked = false;
  }
}
