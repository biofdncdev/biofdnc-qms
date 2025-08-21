import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TabService {
  // tabPath: key used to deduplicate a tab, navUrl: actual router URL to navigate
  private _open$ = new Subject<{ title: string; tabPath: string; navUrl: string }>();
  readonly open$ = this._open$.asObservable();

  requestOpen(title: string, tabPath: string, navUrl: string){
    this._open$.next({ title, tabPath, navUrl });
  }
}


