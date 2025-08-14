import network, time

def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect("SSID", "password")
    while not wlan.isconnected():
        time.sleep(1)
    print("Wifi connected")