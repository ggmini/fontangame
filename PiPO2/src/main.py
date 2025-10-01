from machine import Pin, SoftI2C
from ssd1306 import SSD1306_I2C
import time, math
from max30102 import MAX30102, MAX30105_PULSE_AMP_MEDIUM
import wifi, mqtt, sys

def calculate_spO2(red_max, red_min, ir_max, ir_min):
    """Calculates the Oxygen Saturation from current sensor values

    Args:
        red_max (_type_): Max current value from the RED Sensor
        red_min (_type_): Min current value from the RED Sensor
        ir_max (_type_): Max current value from the IR Sensor
        ir_min (_type_): Min current value from the IR Sensor

    Returns:
        _type_: Current Oxygen Saturation
    """
    red_DC = (red_max + red_min) / 2
    red_AC = (red_max - red_min)
    
    ir_DC = (ir_max + ir_min) / 2
    ir_AC = ir_max - ir_min
    
    R_val = (red_AC / red_DC) / (ir_AC / ir_DC)
    spO2 = (1.5958422 * (R_val * R_val)) + (-34.6596622 * R_val) + 112.6898759
    return spO2

def main():
    #Set up the Screen
    width=128 
    height=64    
    oledI2C = SoftI2C(sda=Pin(26),
                      scl=Pin(27),
                      freq=200000)
    oled = SSD1306_I2C(width,height,oledI2C)
    
    #Connect to WIFI
    oled.fill(0)
    oled.text("Booting...", 0, 00)
    oled.text("WiFi Connecting", 0, 20)
    oled.show()
    
    wifi.connect()
    client = mqtt.connect()
    client.subscribe("fontangame/pipo2")
    
    #Set up the MAX Sensor
    oled.fill(0)
    oled.text("Booting...", 0, 0)
    oled.text("Sensor searching", 0, 20)
    oled.show()
    
    i2c = SoftI2C(sda=Pin(0),
                  scl=Pin(1),
                  freq=40000)
    sensor = MAX30102(i2c=i2c)
    
    if sensor.i2c_address not in i2c.scan(): # Scan I2C bus to ensure that the sensor is connected
        oled.fill(0)
        oled.text(":(", 0, 20)
        oled.text("Sensor not found", 0, 40)
        oled.show()
        raise Exception("Sensor not found")
    elif not (sensor.check_part_id()): # Check that the targeted sensor is compatible
        oled.fill(0)
        oled.text(":(", 0, 20)
        oled.text("I2C is not a MAX", 0, 40)
        oled.show()
        raise Exception("I2C device ID not corresponding to MAX30102 or MAX30105.")
    else:
        print("Sensor connected and recognized.")
        oled.fill(0)
        oled.text("Booting...", 0, 0)
        oled.text("Sensor Connected", 0, 20)
        oled.text("Starting Acquisition", 0, 40)
        oled.show()

    sensor.setup_sensor()
    sensor.set_sample_rate(3200)
    sensor.set_fifo_average(8)
    sensor.set_active_leds_amplitude(MAX30105_PULSE_AMP_MEDIUM)

    #Start Data Acquisition
    print(f"Temp: {sensor.read_temperature()}°C")
    print("Starting data acquisition from RED & IR...")

    oled.fill(0)
    oled.text("Booted.", 0, 0)
    oled.text("Waiting for Data", 0, 20)
    oled.text("from RED & IR", 0, 40)
    oled.show()

    samples_n = 0
    bpm = 0
    #arrays to store last x values of ir change and bpm and spo2 for average
    irChngStor = [0] * 5
    bpmStor = [0] * 10
    spO2Stor= [0] * 20
    #hold ir values so that we can calc change between values
    prev = 0
    curr = 0
    #bool for if we are looking for peak
    lookpeak = True
    #to store when we check a beat and can compare the difference in time to calc bpm
    millis = time.ticks_ms()
    #store the highest and lowest ir and red values from each beat for spo2 calculation
    irHigh = 0
    irLow = 1000000
    redHigh = 0
    redLow = 1000000
    try:
        while True:
            client.check_msg()
            #check must be polled continuously to check if there are new readings in the fifo queue. if readings are available they will be put into storage 
            sensor.check()
            timeout = 0

            #check if storage contains samples
            if sensor.available():
                #access the fifo queue and gather readings (ints)
                red_reading = sensor.pop_red_from_storage()
                ir_reading = sensor.pop_ir_from_storage()
                
                #calc change in ir value between last 2 reads and add it to list and calc average of last 5
                prev = curr
                curr = ir_reading
                irChngStor.pop(0)
                irChngStor.append(curr - prev)
                avgChng = sum(irChngStor) / 5
                
                #if we just passed a peak and were looking for a peak calc bpm
                if avgChng < -5 and lookpeak:
                    timeout = 0
                    #calc bpm as ms per second/ms between beats
                    bpm = 60000 / (time.ticks_ms() - millis)
                    #reset the time stored for start of time between this beat and next
                    millis = time.ticks_ms()
                    bpmStor.pop(0)
                    bpmStor.append(bpm)
                    
                    #print avg of last ten bpm, eliminate high and low vals
                    bpm = ((sum(bpmStor) - (max(bpmStor) + min(bpmStor))) / (len(bpmStor) - 2))
                    print ("bpm", round(bpm))
                    PR = bpm
                    lookpeak = False
                    
                    #find spo2
                    #remove oldest val and add newest
                    spO2Stor.pop(0)
                    spO2Stor.append(calculate_spO2(redHigh, redLow, irHigh, irLow))
                    #average the array of stored spO2 vals but remove min and max (possible outliers)
                    spO2local = ((sum(spO2Stor) - (max(spO2Stor) + min(spO2Stor))) / (len(spO2Stor) - 2))
                    print("SpO2", round(spO2local, 2), "%")
                    
                    #reset vals for next beat
                    irHigh = 0
                    irLow = 100000
                    redHigh = 0
                    redLow = 100000

                    #output to display
                    oled.fill(0)
                    bpm = str(round(bpm))
                    spO2 = str(round(spO2local, 2))
                    bpmScreen = "BPM: " + bpm
                    spO2Screen = "SpO2: " + spO2 + "%"
                    oled.text(bpmScreen, 0, 20)
                    oled.text(spO2Screen, 0, 40)
                    oled.show()                    
                    
                    mqtt.publish(client, "fontangame/spo2", spO2)
                    mqtt.publish(client, "fontangame/bpm", bpm)
                    
                #if were not looking for beat check if we should be looking for beat
                elif avgChng > 0.5 and not lookpeak:
                    lookpeak = True
                
                #see if vals are high or low in beat
                if (ir_reading > irHigh):
                    irHigh = ir_reading
                if (ir_reading < irLow):
                    irLow = ir_reading
                if (red_reading > redHigh):
                    redHigh = red_reading
                if (red_reading < redLow):
                    redLow = red_reading
    except OSError: #assume a sensor error
        try:
            mqtt.publish(client, "fontangame/pipo2", "disconnected") #try to send disconnect message
            oled.fill(0)
            oled.text(":(", 0, 0)
            oled.text("Sensor Connection", 0, 20)
            oled.text("lost", 0, 40)
            oled.show()
        except OSError: #this is either a wifi/mqtt connection error or a screen error (if the error message is displayed the screen is obviously still working)
            oled.fill(0)
            oled.text(":(", 0, 20)
            oled.text("OSError", 0, 40)
            oled.show()
        time.sleep(3)        
        sys.exit()
    except Exception: #catch all for any other errors
        oled.fill(0)
        oled.text(":(", 0, 0)
        oled.text("Unknown", 0, 20)
        oled.text("Error", 0, 40)
        oled.show()
        time.sleep(3)        
        sys.exit()
        
        
if __name__ == "__main__":
    main()