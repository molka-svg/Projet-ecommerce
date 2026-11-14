/**
 * eshop — Projet e-commerce (Angular + Strapi)
 * Développé par FERCHICHI Molka
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
