import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api/api-service';
import { Conversation, Message } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-messagerie',
  imports: [DatePipe, FormsModule, Icon],
  templateUrl: './messagerie.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Messagerie {
  private readonly api = inject(ApiService);

  readonly conversations = toSignal(this.api.getConversations(), { initialValue: null });
  readonly current = signal<Conversation | null>(null);
  readonly messages = signal<Message[] | null>(null);
  readonly draft = signal('');
  readonly sending = signal(false);

  open(c: Conversation) {
    this.current.set(c);
    this.messages.set(null);
    this.api.getMessages(c.id).subscribe(m => this.messages.set(m));
  }

  send() {
    const c = this.current();
    const content = this.draft().trim();
    if (!c || !content || this.sending()) return;
    this.sending.set(true);
    this.api.sendMessage(c.id, content).subscribe({
      next: m => { this.messages.update(l => [...(l ?? []), m]); this.draft.set(''); this.sending.set(false); },
      error: () => this.sending.set(false),
    });
  }
}