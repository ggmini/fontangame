import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { MqttModule } from 'ngx-mqtt';

import { MQTT_SERVICE_OPTIONS } from './credentials';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(MqttModule.forRoot(MQTT_SERVICE_OPTIONS)), provideAnimationsAsync()
  ]
};
