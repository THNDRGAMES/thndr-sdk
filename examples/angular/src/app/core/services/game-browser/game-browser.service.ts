import { inject, Injectable } from '@angular/core';
import { BackgroundColor, InAppBrowser, ToolBarType } from '@capgo/inappbrowser';
import { ThndrDataPayloadSchema } from '../game-messenger/model/thndr-data-payload';
import { GameMessengerService } from '../game-messenger/game-messenger.service';
import { MessageCommandType } from '../game-messenger/model/message-command';
import { ZodError } from 'zod';
import { ThndrOriginPayloadSchema } from '../game-messenger/model/thndr-origin-payload';
import { SelfSourceError } from '../../../common/errors/self-source-error';
import { GameId } from 'src/app/common/model/game-id';
import { assertNever } from 'src/app/common/utils/assert.utils';

@Injectable({
  providedIn: 'root',
})
export class GameBrowserService {
  private gameMessengerService = inject(GameMessengerService);

  public async startBrowser(gameId: GameId, onClosed: () => void): Promise<void> {
    try {
      const gameSrc = await this.gameMessengerService.generateGameUrl(gameId);

      await InAppBrowser.openWebView({
        url: gameSrc,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        toolbarType: ToolBarType.BLANK,
        backgroundColor: BackgroundColor.BLACK,
        visibleTitle: false,
        isPresentAfterPageLoad: true,
        activeNativeNavigationForWebview: false,
        disableGoBackOnNativeApplication: true,
        isAnimated: false,
        toolbarColor: '#000000',
      });

      // Wait for the page to load, then inject the script for the floating button
      const loadListener = await InAppBrowser.addListener('browserPageLoaded', async () => {
        // Inject the script for bidirectional communication
        await InAppBrowser.executeScript({
          code: `
          window.addEventListener("message", (event) => {
            if (event && event.data && event.origin) {
              window.mobileApp.postMessage({ detail: { data: event.data, origin: event.origin } });
            }
          });

          window.addEventListener("messageFromNative", (event) => {
            if (event && event.detail && event.detail.payload && event.detail.origin) {
              window.postMessage(event.detail.payload, event.detail.origin);
            }
          });
        `,
        });
        loadListener.remove();
      });

      await InAppBrowser.addListener('messageFromWebview', async (msg) => {
        try {
          const result = ThndrOriginPayloadSchema.safeParse(msg.detail);
          if (!result.success) {
            // Check for valid THNDR message types first
            console.warn(`Invalid message: ${JSON.stringify(msg.detail)}`);
            return;
          }

          const command = await this.gameMessengerService.handleThndrDataPayload(
            ThndrDataPayloadSchema.parse(msg.detail),
          );

          switch (command.type) {
            case MessageCommandType.PostMessage:
              await this.postMessageToBrowser(command.payload, command.origin);
              break;
            case MessageCommandType.CloseGame:
              await this.closeBrowser();
              onClosed();
              break;
            case MessageCommandType.Noop:
              break;
            default:
              assertNever(command, 'Invalid game message command');
          }
        } catch (error) {
          onClosed();

          if (error instanceof ZodError) {
            console.error('Validation failed:');
            for (const issue of error.errors) {
              console.error(`• [${issue.path.join('.')}] ${issue.message}`);
            }
          } else if (error instanceof SelfSourceError) {
            // Ignoring any messages from self
          } else {
            console.error(`Failed to parse msg data: ${error}`);
          }
        }
      });
    } catch (error) {
      onClosed();
      console.error(`Failed to launch browser`, error);
    }
  }

  private async postMessageToBrowser(payload: string, origin: string): Promise<void> {
    await InAppBrowser.postMessage({
      detail: {
        payload,
        origin,
      },
    });
  }

  private async closeBrowser(): Promise<void> {
    await InAppBrowser.removeAllListeners();
    await InAppBrowser.close();
  }
}
