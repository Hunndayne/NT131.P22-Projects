#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <DHT.h>

const char* ssid = "Hau3007";
const char* password = "23520450";

const char* mqtt_server = "mqtt.home.hunn.io.vn";
const int mqtt_port = 1883;
const char* mqttUser = "hunn";
const char* mqttPassword = "28112005";

unsigned long lastPublishTime = 0;
unsigned long publishInterval = 10000;  // Gửi dữ liệu mỗi 30 giây

// Chân GPIO kết nối với LED ngoài
#define LED_PIN 12 // Chỉnh chân GPIO cho LED ngoài
bool ledState = false;  // Trạng thái LED

#define DHTPIN 25      // Chân GPIO25 kết nối với DATA của DHT11
#define DHTTYPE DHT11  // Loại cảm biến là DHT11

WiFiClient espClient;
PubSubClient client(espClient);
Preferences preferences;
DHT dht(DHTPIN, DHTTYPE);

void saveLedState(bool state) {
    preferences.putBool("state", state);
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("\xf0\x9f\x93\xa5 Nhận dữ liệu từ topic: ");
    Serial.println(topic);
    
    Serial.print("\xf0\x9f\x93\x9c Nội dung: ");
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);

    if (message == "ON" && !ledState) {
        Serial.println("BẬT LED!");
        digitalWrite(LED_PIN, HIGH);  // Bật LED ngoài (LOW nếu LED có anode chung)
        ledState = true;
        saveLedState(ledState);
    } 
    else if (message == "OFF" && ledState) {
        Serial.println("TẮT LED!");
        digitalWrite(LED_PIN, LOW);  // Tắt LED ngoài (HIGH nếu LED có anode chung)
        ledState = false;
        saveLedState(ledState);
    }
}

void setup_wifi() {
    Serial.print(" Kết nối WiFi...");
    WiFi.begin(ssid, password);
    int timeout = 20;
    while (WiFi.status() != WL_CONNECTED && timeout > 0) {
        delay(500);
        Serial.print(".");
        timeout--;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" ✅ Đã kết nối!");
    } else {
        Serial.println(" ❌ Kết nối WiFi thất bại!");
    }
}

void reconnect() {
    while (!client.connected()) {
        Serial.print(" Đang kết nối MQTT...");
        if (client.connect("ESP32_Client", mqttUser, mqttPassword)) {
            Serial.println(" ✅ MQTT kết nối thành công!");
            client.subscribe("LivingRoom/Lights");
        } else {
            Serial.print(" ❌ Thất bại, mã lỗi = ");
            Serial.print(client.state());
            Serial.println(" -> Thử lại sau 5 giây...");
            delay(5000);
        }
    }
}
void publishSensorData() {
    // Đọc nhiệt độ và độ ẩm từ cảm biến DHT11
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Kiểm tra nếu có lỗi khi đọc dữ liệu
    if (isnan(h) || isnan(t)) {
        Serial.println("Failed to read from DHT sensor!");
        return;
    }

    // Gửi giá trị độ ẩm và nhiệt độ lên MQTT
    char humidityStr[8];
    char temperatureStr[8];
    dtostrf(h, 1, 2, humidityStr);
    dtostrf(t, 1, 2, temperatureStr);

    client.publish("Home/Sensor/Humidity", humidityStr);
    client.publish("Home/Sensor/Temperature", temperatureStr);
}
void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    preferences.begin("led_state", false);

    ledState = preferences.getBool("state", false);
    digitalWrite(LED_PIN, LOW);

    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}


void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();  // Xử lý các tin nhắn nhận từ MQTT

    unsigned long currentMillis = millis();
    if (currentMillis - lastPublishTime >= publishInterval) {
        // Nếu đến thời gian gửi dữ liệu cảm biến
        publishSensorData();
        lastPublishTime = currentMillis;
    }
}
