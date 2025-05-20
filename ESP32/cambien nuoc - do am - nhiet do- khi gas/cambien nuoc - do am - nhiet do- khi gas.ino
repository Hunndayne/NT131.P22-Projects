#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

const char* ssid = "choukchour";
const char* password = "bchaubchau";
const char* mqtt_server = "mqtt.home.hunn.io.vn";
const int mqtt_port = 1883;
const char* mqttUser = "hunn";
const char* mqttPassword = "28112005";
const char* mqttWaterTopic = "Bathroom/Sensor/Water"; // Topic cho cảm biến nước
const char* mqttGasTopic = "Kitchen/Sensor/Gas";    // Topic cho cảm biến khí gas
const char* mqttLivingRoomLightsTopic = "LivingRoom/Lights";
const char* mqttKitchenLightsTopic = "Kitchen/Lights";
const char* mqttBedroomLightsTopic = "Bedroom/Lights";
const char* mqttHumidityTopic = "Home/Sensor/Humidity";
const char* mqttTemperatureTopic = "Home/Sensor/Temperature";

// Chân kết nối cho cảm biến nước
const int waterSensorPin = 34; // GPIO34 (chân analog trên ESP32)
const int waterDetectedThreshold = 250; // Ngưỡng phát hiện nước (điều chỉnh nếu cần)
bool lastWaterDetected = false;       // Biến lưu trạng thái phát hiện nước lần trước

// Chân kết nối cho cảm biến khí gas MQ
const int mqSensorPin = 35;     // GPIO35 (chân analog trên ESP32)
const int gasDetectedThreshold = 600; // Ngưỡng phát hiện khí gas (điều chỉnh nếu cần)
bool lastGasDetected = false;         // Biến lưu trạng thái phát hiện khí gas lần trước

// Chân kết nối cho đèn LED điều khiển từ MQTT
const int livingRoomLedPin = 2;
const int kitchenLedPin = 4;
const int bedroomLedPin = 15;

// Chân kết nối cho cảm biến DHT
const int dhtPin = 16; // Chân OUT của DHT11/DHT22 cắm vào GPIO16
#define DHTTYPE DHT11   // Thay DHT11 bằng DHT22 nếu bạn dùng loại khác
DHT dht(dhtPin, DHTTYPE);

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Received data from topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Điều khiển đèn LED dựa trên topic và message
  if (strcmp(topic, mqttLivingRoomLightsTopic) == 0) {
    if (message == "ON") {
      digitalWrite(livingRoomLedPin, HIGH);
    } else if (message == "OFF") {
      digitalWrite(livingRoomLedPin, LOW);
    }
  } else if (strcmp(topic, mqttKitchenLightsTopic) == 0) {
    if (message == "ON") {
      digitalWrite(kitchenLedPin, HIGH);
    } else if (message == "OFF") {
      digitalWrite(kitchenLedPin, LOW);
    }
  } else if (strcmp(topic, mqttBedroomLightsTopic) == 0) {
    if (message == "ON") {
      digitalWrite(bedroomLedPin, HIGH);
    } else if (message == "OFF") {
      digitalWrite(bedroomLedPin, LOW);
    }
  }
}

bool setup_wifi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int attempts = 0;
  const int maxAttempts = 20;
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to WiFi!");
    return true;
  } else {
    Serial.println("\n❌ Failed to connect to WiFi!");
    return false;
  }
}

bool reconnect() {
  Serial.print("Connecting to MQTT...");
  if (client.connect("ESP32_Client", mqttUser, mqttPassword)) {
    Serial.println("\n✅ MQTT connected successfully!");
    client.subscribe(mqttWaterTopic);
    client.subscribe(mqttGasTopic);
    client.subscribe(mqttLivingRoomLightsTopic);
    client.subscribe(mqttKitchenLightsTopic);
    client.subscribe(mqttBedroomLightsTopic);
    client.subscribe(mqttHumidityTopic);    // Subscribe topic độ ẩm
    client.subscribe(mqttTemperatureTopic); // Subscribe topic nhiệt độ
    return true;
  } else {
    Serial.print("\n❌ Failed, error code = ");
    Serial.println(client.state());
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(livingRoomLedPin, OUTPUT);
  pinMode(kitchenLedPin, OUTPUT);
  pinMode(bedroomLedPin, OUTPUT);
  digitalWrite(livingRoomLedPin, LOW);
  digitalWrite(kitchenLedPin, LOW);
  digitalWrite(bedroomLedPin, LOW);

  dht.begin(); // Khởi tạo cảm biến DHT

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
    delay(5000);
    return;
  }
  client.loop();

  // Đọc giá trị từ cảm biến nước
  int waterSensorValue = analogRead(waterSensorPin);
  bool currentWaterDetected = (waterSensorValue > waterDetectedThreshold);

  Serial.print("Giá trị cảm biến nước (GPIO34): ");
  Serial.println(waterSensorValue);

  // Kiểm tra và xử lý dữ liệu cảm biến nước và gửi MQTT khi trạng thái thay đổi
  if (currentWaterDetected != lastWaterDetected) {
    if (currentWaterDetected) {
      Serial.println("Trạng thái nước: Phát hiện có nước!");
      client.publish(mqttWaterTopic, "water_detected");
    } else {
      Serial.println("Trạng thái nước: Không có nước.");
      client.publish(mqttWaterTopic, "no_water");
    }
    lastWaterDetected = currentWaterDetected;
  }

  // Đọc giá trị từ cảm biến khí gas MQ
  int mqSensorValue = analogRead(mqSensorPin);
  bool currentGasDetected = (mqSensorValue > gasDetectedThreshold);

  Serial.print("Giá trị cảm biến khí gas MQ (GPIO35): ");
  Serial.println(mqSensorValue);

  // Kiểm tra và xử lý dữ liệu cảm biến khí gas và gửi MQTT khi trạng thái thay đổi
  if (currentGasDetected != lastGasDetected) {
    if (currentGasDetected) {
      Serial.println("Trạng thái khí gas: Phát hiện khí gas!");
      client.publish(mqttGasTopic, "gas_detected");
    } else {
      Serial.println("Trạng thái khí gas: Không phát hiện khí gas.");
      client.publish(mqttGasTopic, "no_gas");
    }
    lastGasDetected = currentGasDetected;
  }

  // Đọc và gửi dữ liệu nhiệt độ và độ ẩm mỗi 5 giây
  static unsigned long lastDHTPublishTime = 0;
  unsigned long currentMillis = millis();

  if (currentMillis - lastDHTPublishTime >= 5000) {
    lastDHTPublishTime = currentMillis;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    Serial.print("Humidity: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.println(" *C");

    client.publish(mqttHumidityTopic, String(h).c_str(), true); // Gửi độ ẩm (retained)
    client.publish(mqttTemperatureTopic, String(t).c_str(), true); // Gửi nhiệt độ (retained)
  }

  Serial.println("---"); // Dấu phân cách giữa các lần đọc
  delay(1000);             // Đợi 1 giây trước khi đọc lại (cho các cảm biến khác)
}