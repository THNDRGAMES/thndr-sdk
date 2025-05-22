import { inject, Injectable } from '@angular/core';
import { WidgetReceiveType, WidgetSendType } from './model/message-types';
import { MessageCommand, MessageCommandType } from './model/message-command';
import { WidgetPayload } from './model/widget-payload';
import { SelfSourceError } from '../../../common/errors/self-source-error';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GameId } from 'src/app/common/model/game-id';
import { normalizeError } from 'src/app/common/errors/error-utilities';
import { PAGE } from 'src/app/routes';

@Injectable({
  providedIn: 'root',
})
export class WidgetMessengerService {
  private alertController = inject(AlertController);
  private router = inject(Router);

  private readonly sdkVersion = '2.0.0';
  private readonly appSource = 'clinch-example';
  private readonly operatorId = 'thndr';
  private readonly widgetUri = 'https://embed-inhouse-24748543997.us-central1.run.app';

  public async generateWidgetUrl(gameId: GameId): Promise<string> {
    const currentLanguageIso = 'en';
    const platform = 'ios';
    const widgetUrl = `${this.widgetUri}?operatorId=${this.operatorId}&gameId=${gameId}&language=${currentLanguageIso}&platform=${platform}`;
    return widgetUrl;
  }

  public async handleWidgetPayload(payload: WidgetPayload): Promise<MessageCommand> {
    if (payload.origin !== this.widgetUri) {
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
      case WidgetReceiveType.GET_SDK_VERSION:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.widgetUri,
          payload: generatePayload({
            message: WidgetSendType.SET_SDK_VERSION,
            version: this.sdkVersion,
          }),
        };
      case WidgetReceiveType.GET_TOKEN:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.widgetUri,
          payload: generatePayload({
            message: WidgetSendType.SET_TOKEN,
            token: await this.generateToken(),
          }),
        };
      case WidgetReceiveType.GET_BALANCE:
        return {
          type: MessageCommandType.PostMessage,
          origin: this.widgetUri,
          payload: generatePayload({
            message: WidgetSendType.SET_BALANCE,
            balance: 0,
            currency: 'cents',
          }),
        };
      case WidgetReceiveType.DEMO_BALANCE_UPDATE:
        break;
      case WidgetReceiveType.PAY_INVOICE:
        this.payInvoice(payload.data.data.invoice);
        break;
      case WidgetReceiveType.CANCEL_INVOICE:
        break;
      case WidgetReceiveType.REDIRECT:
        return {
          type: MessageCommandType.CloseWidget,
        };
      case WidgetReceiveType.CLOSE:
        return {
          type: MessageCommandType.CloseWidget,
        };
      case WidgetReceiveType.HANDLE_PAYMENT_ERROR:
        await this.showErrorAlert(normalizeError(payload.data.data.error).message);
        break;
      case WidgetReceiveType.ANALYTICS_EVENT:
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
