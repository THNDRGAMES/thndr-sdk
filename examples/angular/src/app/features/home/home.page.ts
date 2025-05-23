import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GameId } from 'src/app/common/model/game-id';
import { GameBrowserService } from 'src/app/core/services/game-browser/game-browser.service';
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
  private gameBrowserService = inject(GameBrowserService);
  private router = inject(Router);

  gameClicked = false;
  gamesList: GameMetadata[] = [
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

  async onGameClick(gameId: string): Promise<void> {
    // Prevent multiple clicking
    if (this.gameClicked) {
      return;
    }
    this.gameClicked = true;

    if (Capacitor.isNativePlatform()) {
      // For native, open the inappbrowser
      await this.gameBrowserService.startBrowser(gameId as GameId, () => {
        this.gameClicked = false;
      });
    } else {
      // For web, open an iframe
      await this.router.navigate([`${PAGE.GAME_IFRAME}/${gameId}`]);
      this.gameClicked = false;
    }
  }
}
