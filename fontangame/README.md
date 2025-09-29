# Fontangame

A gamified Sports Application meant to encourage young adults with Fontan Circulations to partake in high intensity (high pulse) sports.

## Requirements

- Compatible Version of NodeJS (22.17.1)
- Compatible Version of Angular CLI (17.3.17)
    - Install with `npm install -g @angular/cli`
- A Pulseoximeter which sends it's data via MQTT.

## How to Run

- Make sure you have a compatible version of NodeJS and Angular CLI installed.  
- Rename `credentials.ts.template` in the `src\app` to `credentials.ts` and enter your MQTT Broker Information.
- Run `npm install`
- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
`ng serve -o` will run the the dev server and open your default browser.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.  
Developed with NodeJS version 22.17.1.