import { NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import type { AppProps } from 'single-spa';
import { singleSpaAngular } from 'single-spa-angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const lifecycles = singleSpaAngular<AppProps>({
  // @ts-ignore
  bootstrapFunction: (/*singleSpaProps: AppProps*/) => {
    return bootstrapApplication(AppComponent, appConfig);
  },
  template: '<app-root />',
  domElementGetter: () => document.getElementById('single-spa:main') as HTMLElement,
  Router,
  NgZone,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
