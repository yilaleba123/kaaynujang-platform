import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../api/api-service';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Statistiques {
  readonly stats = toSignal(inject(ApiService).getStats(), { initialValue: null });
}