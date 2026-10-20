import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-file-drop',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus-within:ring-2 focus-within:ring-ink/20"
           [class]="(invalid() || error()) ? 'border-red-400 bg-red-50/40' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'">
      <app-icon name="upload" [size]="22" />
      @if (file(); as f) {
        <span class="break-all text-sm font-semibold">{{ f.name }}</span>
        <button type="button" class="text-xs font-medium text-red-600 hover:underline" (click)="remove($event)">Retirer le fichier</button>
      } @else {
        <span class="text-sm font-semibold">Cliquez pour sélectionner un fichier</span>
        <span class="text-xs text-slate-500">{{ hint() }}</span>
      }
      <input type="file" class="sr-only" [accept]="accept()" (change)="onChange($event)" />
    </label>
    @if (error()) { <p class="err">{{ error() }}</p> }
    @else if (invalid()) { <p class="err">Ce fichier est obligatoire.</p> }`,
})
export class FileDrop {
  readonly accept = input('.pdf,.jpg,.jpeg,.png');
  readonly maxMb = input(5);
  readonly hint = input('PDF, JPG ou PNG - max 5 Mo');
  readonly invalid = input(false);
  readonly file = model<File | null>(null);
  protected readonly error = signal<string | null>(null);

  onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    input.value = ''; // permet de re-choisir le même fichier
    if (!f) return;
    const allowed = this.accept().split(',').map(x => x.trim().toLowerCase());
    const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase();
    if (!allowed.includes(ext)) { this.error.set(`Format non accepté (${this.accept().replaceAll('.', '').toUpperCase()}).`); return; }
    if (f.size > this.maxMb() * 1024 * 1024) { this.error.set(`Fichier trop lourd (max ${this.maxMb()} Mo).`); return; }
    this.error.set(null);
    this.file.set(f);
  }

  remove(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.file.set(null);
  }
}