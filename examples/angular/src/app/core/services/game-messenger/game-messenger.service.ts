import { inject, Injectable } from '@angular/core';
import { GameReceiveType, GameSendType } from './model/message-types';
import { MessageCommand, MessageCommandType } from './model/message-command';
import { ThndrDataPayload } from './model/thndr-data-payload';
import { SelfSourceError } from '../../../common/errors/self-source-error';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GameId } from 'src/app/common/model/game-id';
import { normalizeError } from 'src/app/common/errors/error-utilities';
import { PAGE } from 'src/app/routes';

@Injectable({
  providedIn: 'root',
})
export class GameMessengerService {
  private alertController = inject(AlertController);
  private router = inject(Router);

  private readonly sdkVersion = '2.0.0';
  private readonly appSource = 'thndr-example';
  private readonly operatorId = 'thndr';
  private readonly gameUri = 'https://embed-24748543997.us-central1.run.app';

  public async generateGameUrl(gameId: GameId): Promise<string> {
    const currentLanguageIso = 'en';
    const platform = 'ios';
    return `${this.gameUri}?operatorId=${this.operatorId}&gameId=${gameId}&language=${currentLanguageIso}&platform=${platform}`;
  }

  public async handleThndrDataPayload(payload: ThndrDataPayload): Promise<MessageCommand> {
    if (payload.origin !== this.gameUri) {
      throw new Error(`Invalid origin: ${payload.origin}`);
    }

    if (payload.data.source === this.appSource) {
      throw new SelfSourceError(`Invalid source: ${payload.data.source}`);
    }

    const generatePayload = (payload: { message: string } & Record<string, unknown>): string => {
      const enrichedPayload = {
        ...payload,
        source: this.appSource,
      };
      return JSON.stringify(enrichedPayload);
    };

    switch (payload.data.message) {
      case GameReceiveType.GET_SDK_VERSION:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.gameUri,
          payload: generatePayload({
            message: GameSendType.SET_SDK_VERSION,
            version: this.sdkVersion,
          }),
        };
      case GameReceiveType.GET_TOKEN:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.gameUri,
          payload: generatePayload({
            message: GameSendType.SET_TOKEN,
            token: await this.generateToken(),
          }),
        };
      case GameReceiveType.GET_BALANCE:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.gameUri,
          payload: generatePayload({
            message: GameSendType.SET_BALANCE,
            balance: 0,
            currency: 'cents',
          }),
        };
      case GameReceiveType.PAY_INVOICE:
        this.payInvoice(payload.data.data.invoice);
        break;
      case GameReceiveType.CANCEL_INVOICE:
        break;
      case GameReceiveType.REDIRECT:
        return {
          type: MessageCommandType.CloseGame,
        };
      case GameReceiveType.CLOSE:
        return {
          type: MessageCommandType.CloseGame,
        };
      case GameReceiveType.HANDLE_PAYMENT_ERROR:
        await this.showErrorAlert(normalizeError(payload.data.data.error).message);
        break;
      case GameReceiveType.ANALYTICS_EVENT:
        await this.parseAnalyticsEvent(payload.data.data.eventName);
        break;
    }

    return {
      type: MessageCommandType.Noop,
    };
  }

  private async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Fatal error',
      message,
      cssClass: 'alert',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button',
          handler: async () => {
            this.router.navigate([PAGE.HOME]);
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  private async parseAnalyticsEvent(eventName: string) {
    console.log(`Analytics event: ${eventName}`);
  }

  private async generateToken(): Promise<string> {
    return '';
  }

  private payInvoice(invoice: string): void {
    console.log(`Pay invoice: ${invoice}`);
  }
}
