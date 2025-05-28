#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// WiFi & MQTT config
const char* ssid = "hunn";
const char* password = "28112005";
const char* mqtt_server = "mqtt.home.hunn.io.vn";
const int mqtt_port = 1883;
const char* mqttUser = "hunn";
const char* mqttPassword = "28112005";

// MQTT Topics
const char* mqttGasTopic = "Kitchen/Sensor/Gas";
const char* mqttLivingRoomLightsTopic = "LivingRoom/Lights";
const char* mqttKitchenLightsTopic = "Kitchen/Lights";
const char* mqttBedroomLightsTopic = "Bedroom/Lights";
const char* mqttHumidityTopic = "Home/Sensor/Humidity";
const char* mqttTemperatureTopic = "Home/Sensor/Temperature";

// GPIO setup
const int mqSensorPin = 35;
const int gasDetectedThreshold = 600;
bool lastGasDetected = false;

const int livingRoomLedPin = 2;
const int kitchenLedPin = 4;
const int bedroomLedPin = 15;

const int dhtPin = 16;
#define DHTTYPE DHT11
DHT dht(dhtPin, DHTTYPE);

// MQTT client setup
WiFiClient espClient;
PubSubClient client(espClient);

bool hasSentGasAlert = false; // biến gửi khí gas

void setup_wifi() {
  Serial.print("🔌 Connecting to WiFi");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 20) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
  } else {
    Serial.println("\n❌ Failed to connect to WiFi!");
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.printf("📩 MQTT Message [%s]: %s\n", topic, message.c_str());

  int state = (message == "ON") ? HIGH : LOW;

  if (strcmp(topic, mqttLivingRoomLightsTopic) == 0) {
    digitalWrite(livingRoomLedPin, state);
  } else if (strcmp(topic, mqttKitchenLightsTopic) == 0) {
    digitalWrite(kitchenLedPin, state);
  } else if (strcmp(topic, mqttBedroomLightsTopic) == 0) {
    digitalWrite(bedroomLedPin, state);
  }
}

bool reconnect() {
  if (client.connect("ESP32_Client", mqttUser, mqttPassword)) {
    Serial.println("✅ MQTT connected");
    client.subscribe(mqttGasTopic);
    client.subscribe(mqttLivingRoomLightsTopic);
    client.subscribe(mqttKitchenLightsTopic);
    client.subscribe(mqttBedroomLightsTopic);
    client.subscribe(mqttHumidityTopic);
    client.subscribe(mqttTemperatureTopic);
    return true;
  } else {
    Serial.printf("❌ MQTT connect failed, state: %d\n", client.state());
    return false;
  }
}

void publishDHTData() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("⚠️ DHT reading failed");
    return;
  }

  Serial.printf("🌡️ Temp: %.1f°C | 💧 Humidity: %.1f%%\n", t, h);
  client.publish(mqttTemperatureTopic, String(t).c_str(), true);
  client.publish(mqttHumidityTopic, String(h).c_str(), true);
}

void setup() {
  Serial.begin(115200);

  pinMode(livingRoomLedPin, OUTPUT);
  pinMode(kitchenLedPin, OUTPUT);
  pinMode(bedroomLedPin, OUTPUT);
  digitalWrite(livingRoomLedPin, LOW);
  digitalWrite(kitchenLedPin, LOW);
  digitalWrite(bedroomLedPin, LOW);

  dht.begin();

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    if (!reconnect()) {
      delay(5000);
      return;
    }
  }
  client.loop();

  // Đọc giá trị từ cảm biến khí gas MQ
  int mqSensorValue = analogRead(mqSensorPin);
  bool currentGasDetected = (mqSensorValue > gasDetectedThreshold);

   if (currentGasDetected && !hasSentGasAlert) {
    Serial.printf("⚠️ MQ Gas Value: %d (vượt ngưỡng)\n", mqSensorValue);
    Serial.println("Trạng thái khí gas: Phát hiện khí gas!");
    client.publish(mqttGasTopic, "gas_detected");
    hasSentGasAlert = true;
  }

  // Khi hết cảnh báo, gửi lại 1 lần và reset cờ
  if (!currentGasDetected && hasSentGasAlert) {
    Serial.printf("✅ MQ Gas Value: %d (an toàn trở lại)\n", mqSensorValue);
    Serial.println("Trạng thái khí gas: Không phát hiện khí gas.");
    client.publish(mqttGasTopic, "no_gas");
    hasSentGasAlert = false;
  }

  // DHT SENSOR every 60s
  static unsigned long lastDHTTime = 0;
  if (millis() - lastDHTTime >= 60000) {
    publishDHTData();
    lastDHTTime = millis();
  }

  delay(100); // tránh quá tải vòng lặp
}
