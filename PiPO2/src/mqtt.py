from umqtt.simple import MQTTClient
import ssl

host = "<hostname>"
port = 8883
clientid = "pipo2"
user = "<user>"
pw = "<password>"

def connect():
    """Connects to the preset MQTT Broker and sets the last will

    Returns:
        MQTTClient: A new MQTT Client
    """
    client = MQTTClient(clientid, host, port, user, pw, ssl=True, ssl_params={'server_hostname':host})
    client.set_last_will("fontangame/pipo2", "disconnected", retain=True, qos=2)
    client.connect()
    print("MQTT Connected")
    client.publish("fontangame/pipo2", "connected", retain=True, qos=1)
    return client
    
def publish(client, topic, msg):
    """Publishes a Message to the selected topic using the provided broker without Retain and QOS 0

    Args:
        client (MQTTClient): The MQTT Client to use
        topic (string): The Topic that will be published to
        msg (string): The message that will be published
    """
    client.publish(topic, msg, qos=0)