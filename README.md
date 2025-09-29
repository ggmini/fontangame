# Fontan Game
Fontan Game is a gamified sports application for the web, designed to encourage Young Adults with a Fontan Circulation to do more exercise. Developed as a Bachelors Thesis for the Technische Hochschule Nuremberg with assistance from the childrens cardiology of the University Hospital in Erlangen. 

The repository is split into two parts: a Raspberry Pi Pico powered Pulseoximeter used to observe the users vitals, and an Angular Webapp as the main application. Both parts communicate via the MQTT protocol.

If you want to test this project without the pulseoximeter you can manually send data via an MQTT Broker. The topics are as follows:
- `fontangame/pipo2`: Connection Status of the Pulseoximeter ("connected" or "disconnected")
- `fontangame/bpm`: Current Heart Rate
- `fontangame/spo2`: Current Oxygen Saturation