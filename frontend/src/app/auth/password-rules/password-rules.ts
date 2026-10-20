import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../../shared/icon';
import { PASSWORD_RULES } from '../password-utils';

@Component({
  selector: 'app-password-rules',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl bg-slate-50 p-4">
      <p class="mb-3 text-sm font-semibold text-ink">Le mot de passe doit contenir :</p>
      <ul class="grid gap-2 text-sm sm:grid-cols-2">
        @for (r of rules(); track r.label) {
          <li class="flex items-center gap-2" [class]="r.ok ? 'text-green-700' : 'text-slate-500'">
            <app-icon [name]="r.ok ? 'tick' : 'circle'" [size]="14" /> {{ r.label }}
          </li>
        }
      </ul>
    </div>`,
})
export class PasswordRules {
  readonly value = input('');
  protected readonly rules = computed(() => PASSWORD_RULES.map(r => ({ label: r.label, ok: r.test(this.value()) })));
}