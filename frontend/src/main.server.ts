import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (options?: any) => bootstrapApplication(AppComponent, config, options);

export default bootstrap;
