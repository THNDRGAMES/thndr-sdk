import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEventPattern, Subject, takeUntil } from 'rxjs';
import { normalizeError } from 'src/app/common/errors/error-utilities';
import { GameId } from 'src/app/common/model/game-id';
import { assertNever } from 'src/app/common/utils/assert.utils';
import { SelfSourceError } from 'src/app/common/errors/self-source-error';
import { MessageCommandType } from 'src/app/core/services/game-messenger/model/message-command';
import { ThndrOriginPayloadSchema } from 'src/app/core/services/game-messenger/model/thndr-origin-payload';
import { ThndrDataPayloadSchema } from 'src/app/core/services/game-messenger/model/thndr-data-payload';
import { GameMessengerService } from 'src/app/core/services/game-messenger/game-messenger.service';
import { PAGE } from 'src/app/routes';
import { ZodError } from 'zod';

@Component({
  selector: 'app-game-iframe',
  templateUrl: './game-iframe.page.html',
  styleUrls: ['./game-iframe.page.scss'],
})
export class GameIframePage implements OnInit, OnDestroy {
  @ViewChild('gameIframe', { static: false }) iframeRef!: ElementRef<HTMLIFrameElement>;

  private activatedRoute = inject(ActivatedRoute);
  private domSanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private gameMessengerService = inject(GameMessengerService);

  private destroy$ = new Subject<void>();

  iframeSrc: SafeResourceUrl | undefined;
  readonly iframeId: string = 'games_iframe';

  async ngOnInit() {
    const gameId =
      (this.activatedRoute.snapshot.paramMap.get('gameId') as GameId) ?? GameId.Solitaire;

    const gameUrl = await this.gameMessengerService.generateGameUrl(gameId);
    this.iframeSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(gameUrl);

    const messages$ = fromEventPattern<MessageEvent>(
      (handler) => window.addEventListener('message', handler),
      (handler) => window.removeEventListener('message', handler),
    );
    messages$.pipe(takeUntil(this.destroy$)).subscribe(async (event) => {
      await this.parseMessage(event);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private parseMessage = async (event: MessageEvent) => {
    try {
      const result = ThndrOriginPayloadSchema.safeParse({ data: event.data, origin: event.origin });
      if (!result.success) {
        // Check for valid THNDR message types first
        return;
      }

      const command = await this.gameMessengerService.handleThndrDataPayload(
        ThndrDataPayloadSchema.parse({ data: event.data, origin: event.origin }),
      );

      switch (command.type) {
        case MessageCommandType.PostMessage:
          this.postMessageToIframe(command.payload, command.origin);
          break;
        case MessageCommandType.CloseGame:
          this.router.navigate([PAGE.HOME]);
          break;
        case MessageCommandType.Noop:
          break;
        default:
          assertNever(command, 'Invalid game message command');
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Game data validation failed:');

        for (const issue of error.errors) {
          console.error(`> [${issue.path.join('.')}] ${issue.message}`);
        }
      } else if (error instanceof SelfSourceError) {
        // Ignoring any messages from self
      } else {
        console.error(`Failed to parse msg data: ${normalizeError(error)}`);
      }
    }
  };

  private postMessageToIframe(payload: string, origin: string): void {
    if (this.iframeRef?.nativeElement?.contentWindow) {
      this.iframeRef.nativeElement.contentWindow.postMessage(payload, origin);
    } else {
      console.error('THNDR SDK: Unable to find the iframe');
    }
  }
}
