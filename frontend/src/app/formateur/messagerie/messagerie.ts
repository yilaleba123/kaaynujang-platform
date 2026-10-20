import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

  readonly conversations = signal<Conversation[] | null>(null);
  readonly current = signal<Conversation | null>(null);
  readonly messages = signal<Message[] | null>(null);
  readonly draft = signal('');
  readonly sending = signal(false);
  readonly conversationsError = signal(false);
  readonly messagesError = signal(false);
  readonly sendError = signal(false);

  constructor() {
    this.loadConversations();
  }

  loadConversations() {
    this.conversationsError.set(false);
    this.conversations.set(null);
    this.api.getConversations().subscribe({
      next: conversations => this.conversations.set(conversations),
      error: () => this.conversationsError.set(true),
    });
  }

  open(c: Conversation) {
    this.current.set(c);
    this.messages.set(null);
    this.loadMessages(c.id);
  }

  loadMessages(id = this.current()?.id) {
    if (!id) return;
    this.messagesError.set(false);
    this.messages.set(null);
    this.api.getMessages(id).subscribe({
      next: messages => this.messages.set(messages),
      error: () => this.messagesError.set(true),
    });
  }

  send() {
    const c = this.current();
    const content = this.draft().trim();
    if (!c || !content || this.sending()) return;
    this.sending.set(true);
    this.sendError.set(false);
    this.api.sendMessage(c.id, content).subscribe({
      next: m => { this.messages.update(l => [...(l ?? []), m]); this.draft.set(''); this.sending.set(false); },
      error: () => { this.sending.set(false); this.sendError.set(true); },
    });
  }
}