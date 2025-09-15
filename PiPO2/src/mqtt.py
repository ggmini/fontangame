from umqtt.simple import MQTTClient
import ssl

host = "<hostname>"
port = 8883
clientid = "pipo2"
user = "<user>"
pw = "<password>"

def connect():
    global myClient
    client = MQTTClient(clientid, host, port, user, pw, ssl=True, ssl_params={'server_hostname':host})
    client.connect()
    print("MQTT Connected")
    client.set_callback(handleMessage)
    client.subscribe("fontangame/pipo2")
    client.publish("fontangame/pipo2", "connected", qos=1)
    myClient = client
    return client
    
def publish(client, topic, msg):
    client.publish(topic, msg, qos=0)    

def handleMessage(btopic, bmsg):
    global myClient
    topic = btopic.decode("utf-8")
    msg = bmsg.decode("utf-8")
    if topic == "fontangame/pipo2" and msg == "state":
        publish("fontangame/pipo2", "connected")