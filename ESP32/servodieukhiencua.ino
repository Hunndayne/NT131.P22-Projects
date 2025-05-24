#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

// --- Cấu hình chân ---
#define SS_RFID 5
#define RST_RFID 0
#define PIN_SERVO_DOOR 13 
#define PIN_SERVO_WINDOW 4
#define PIN_SENSOR_RAIN 2

// --- Cấu hình WiFi ---
const char* ssid = "hunn";
const char* password = "28112005";

// --- Cấu hình MQTT ---
const char* mqtt_server = "mqtt.home.hunn.io.vn";
const int mqtt_port = 1883;
const char* mqttUser = "hunn";
const char* mqttPassword = "28112005";
const char* clientID = "esp32_rfid_servo_ha_01";

// ----- MQTT Topics -----
const char* MQTT_AUTH_TOPIC = "esp32/rfid/authorized_uid";
const char* MQTT_SERVO_DOOR_STATE_TOPIC = "esp32/servo_door/state";
const char* MQTT_SERVO_DOOR_COMMAND_TOPIC = "esp32/servo_door/state";
const char* MQTT_SERVO_WINDOW_STATE_TOPIC = "esp32/rain_servo/state";
const char* MQTT_SERVO_WINDOW_COMMAND_TOPIC = "esp32/rain_servo/state";
const char* MQTT_RAIN_DETECTED_TOPIC = "esp32/rain/detected";
const char* MQTT_NOTIFICATION_TOPIC = "esp32/status/notifications";

// ----- MQTT Payloads -----
const char* PAYLOAD_STATE_OPEN = "OPEN";
const char* PAYLOAD_STATE_CLOSE = "CLOSE";
const char* PAYLOAD_CMD_OPEN = "OPEN";
const char* PAYLOAD_CMD_CLOSE = "CLOSE";
const char* PAYLOAD_RAIN_DETECTED = "RAINING";
const char* PAYLOAD_RAIN_NOT_DETECTED = "DRY";

// --- DANH SÁCH CÁC UID THẺ ĐƯỢC PHÉP ---
const String authorizedUIDs[] = {
    "9D6E4E05", "04235823005980" , "49D84E05",
};
const int NUM_AUTHORIZED_CARDS = sizeof(authorizedUIDs) / sizeof(authorizedUIDs[0]);

// --- Khởi tạo đối tượng ---
WiFiClient espClient;
PubSubClient client(espClient);
MFRC522 rfid(SS_RFID, RST_RFID);
MFRC522::MIFARE_Key key;
Servo servodoor;
Servo servowindow;

// --- Biến lưu trạng thái ---
String lastUid = "";
unsigned long lastReconnect = 0; 
bool isServoDoorOpen = false;
bool isServoWindowOpen = false;
bool Previousrainsensor = false; 
unsigned long lastRainCheckTime = 0;
const unsigned long rainCheckInterval = 2000;

// --- Khai báo hàm ---
void callback(char* topic, byte* payload, unsigned int length);
bool setup_wifi();
bool reconnect_mqtt();
void publishDoorServoState();
void controlDoorServo(bool openServo);
void handleRFID();
bool isCardAuthorized(const String& uid);
void printHex(byte *buffer, byte bufferSize);
void publishNotification(const String& message);
void handleRainSensor();
void controlWindowServo(bool deploy);
void publishWindowServoState();
void publishRainDetectedState(bool isRaining);

// --- SETUP ---
void setup() {
    Serial.begin(115200);
    Serial.println("\n\n--- ESP32 RFID & Rain Servo HA Control ---");
    Serial.print("Number of authorized cards: ");
    Serial.println(NUM_AUTHORIZED_CARDS);
    SPI.begin();
    rfid.PCD_Init();
    delay(4);
    rfid.PCD_DumpVersionToSerial();
    Serial.println("RFID Initialized.");

    servodoor.setPeriodHertz(50);
    servodoor.attach(PIN_SERVO_DOOR, 500, 2400); 
    Serial.print("Door Servo attached to GPIO ");
    Serial.println(PIN_SERVO_DOOR); 
    Serial.println("Setting initial door servo position to CLOSED (0 degrees).");
    controlDoorServo(false);

    servowindow.setPeriodHertz(50);
    servowindow.attach(PIN_SERVO_WINDOW, 500, 2400);
    Serial.print("Rain Servo attached to GPIO ");
    Serial.println(PIN_SERVO_WINDOW);
    Serial.println("Setting initial window servo position to CLOSE (0 degrees).");
    controlWindowServo(false); 

    pinMode(PIN_SENSOR_RAIN, INPUT_PULLUP);
    Serial.print("Rain sensor initialized on GPIO ");
    Serial.println(PIN_SENSOR_RAIN);


    if (!setup_wifi()) {
        Serial.println("WiFi connection failed. Retrying later...");
    }

    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
    Serial.println("Setup finished.");
}

// --- LOOP ---
void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi Disconnected. Attempting reconnect...");
        if (!setup_wifi()) { delay(5000); return; }
        else { lastReconnect = 0; } 
    }
    if (!client.connected()) {
        long now = millis();
        if (now - lastReconnect > 5000) { 
            lastReconnect = now; 
            if (reconnect_mqtt()) { lastReconnect = 0; } 
        }
    } else {
        client.loop();
    }

    handleRFID();
    handleRainSensor();
    delay(50);
}

void publishNotification(const String& message) {
    if (client.connected()) {
        Serial.print("Publishing Notification: ");
        Serial.println(message);
        client.publish(MQTT_NOTIFICATION_TOPIC, message.c_str(), false);
    } else {
        Serial.println("MQTT không có kết nối. Không thể gửi thông báo.");
    }
}

// --- Hàm gửi trạng thái Servo cửa chính lên MQTT ---
void publishDoorServoState() {
    if (client.connected()) {
        const char* statePayload = isServoDoorOpen ? PAYLOAD_STATE_OPEN : PAYLOAD_STATE_CLOSE;
        Serial.print("Trạng thái cửa : ");
        Serial.println(statePayload);
        client.publish(MQTT_SERVO_DOOR_STATE_TOPIC, statePayload, true);

        String notificationMessage = "statusdoor";
        notificationMessage += (isServoDoorOpen ? "open" : "close");
        publishNotification(notificationMessage);
    } else {
        Serial.println("MQTT không có kết nối . Không thể gửi trạng thái của servo cửa.");
    }
}

// --- Hàm điều khiển Servo cửa chính và cập nhật trạng thái ---
void controlDoorServo(bool openServo) {
    bool stateChanged = false; // Khởi tạo stateChanged để theo dõi
    if (openServo) {
        if (!isServoDoorOpen) {
            Serial.println("Servo cửa chính mở 90 độ ");
            servodoor.write(90);
            isServoDoorOpen = true;
            delay(300);
            publishDoorServoState();
        } else {
             Serial.println("Servo cửa chính đã mở.");
        }
    } else {
        if (isServoDoorOpen) {
            Serial.println("Servo cửa chính đóng 0 độ ");
            servodoor.write(0);
            isServoDoorOpen = false;
            delay(300);
            publishDoorServoState();
        } else {
             Serial.println("Servo cửa đã đóng.");
        }
    }
    if (stateChanged) { 
        delay(300); 
        publishDoorServoState(); // Publish trạng thái mới
    }
}

// --- Hàm gửi trạng thái Servo cửa sổ lên MQTT ---
void publishWindowServoState() {
    if (client.connected()) {
        const char* statePayload = isServoWindowOpen ? PAYLOAD_STATE_OPEN : PAYLOAD_STATE_CLOSE;
        Serial.print("Trạng thái servo cửa sổ: ");
        Serial.println(statePayload);
        client.publish(MQTT_SERVO_WINDOW_STATE_TOPIC, statePayload, true);
    } else {
        Serial.println("MQTT không có kết nối. Không thể gửi trạng thái servo mưa.");
    }
}

// --- Hàm điều khiển Servo cửa sổ ---
void controlWindowServo(bool closeWindow) {
    bool stateChanged = false;
    if (closeWindow) { 
        if (isServoWindowOpen) { 
            Serial.println("Servo cửa sổ đóng (0 độ).");
            servowindow.write(0);
            isServoWindowOpen = false; 
            stateChanged = true;
        } else {
            Serial.println("Servo cửa sổ đã đóng cửa.");
        }
    } else { 
        if (!isServoWindowOpen) { 
            Serial.println("Servo cửa sổ mở (90 độ).");
            servowindow.write(90);
            isServoWindowOpen = true; 
            stateChanged = true;
        } else {
            Serial.println("Servo cửa sổ đã mở cửa.");
        }
    }
    if (stateChanged) {
        delay(300);
        publishWindowServoState();
    }
}

// --- Hàm gửi trạng thái cảm biến mưa lên MQTT ---
void publishRainDetectedState(bool isRaining) {
    if (client.connected()) {
        const char* statePayload = isRaining ? PAYLOAD_RAIN_DETECTED : PAYLOAD_RAIN_NOT_DETECTED;
        Serial.print("Trạng thái mưa: ");
        Serial.println(statePayload);
        client.publish(MQTT_RAIN_DETECTED_TOPIC, statePayload, true);

        if (isRaining != Previousrainsensor) { 
             String notificationMessage = "statusrain";
             notificationMessage += (isRaining ? "detected" : "stopped");
             publishNotification(notificationMessage);
             Previousrainsensor = isRaining; 
        }
    } else {
        Serial.println("MQTT không có kết nối. Không thể gửi trạng thái mưa.");
    }
}

// --- Hàm Callback khi nhận dữ liệu MQTT ---
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Received message on topic: ");
    Serial.println(topic);

    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    message.toUpperCase();
    Serial.print("Message: ");
    Serial.println(message);

    // Điều kiển servo cửa chính
    if (strcmp(topic, MQTT_SERVO_DOOR_COMMAND_TOPIC) == 0) {
        Serial.print("Processing door servo command: ");
        Serial.println(message);

        if (message.equals(PAYLOAD_CMD_OPEN)) {
            Serial.println("Command: OPEN DOOR");
            controlDoorServo(true);
        } else if (message.equals(PAYLOAD_CMD_CLOSE)) {
            controlDoorServo(false);
        } else {
            Serial.println("Unknown door servo command.");
            Serial.println(message);
        }
    }

    // Điều kiển servo cửa sổ
    else if (strcmp(topic, MQTT_SERVO_WINDOW_COMMAND_TOPIC) == 0) {
        Serial.print("Received window servo command: ");
        Serial.println(message);

        // PAYLOAD_CMD_OPEN -> mở cửa sổ (servo 90 độ) -> deploy = false
        // PAYLOAD_CMD_CLOSE -> đóng cửa sổ (servo 0 độ) -> deploy = true
        if (message.equals(PAYLOAD_CMD_OPEN)) {
           Serial.println("MQTT: Command OPEN WINDOW");
            controlWindowServo(false); // Mở cửa sổ
            isServoWindowOpen = true;  // Cập nhật trạng thái: Cửa sổ ĐÃ MỞ
            //mqttWindowOverride = true; // Đặt cờ ưu tiên MQTT
        } else if (message.equals(PAYLOAD_CMD_CLOSE)) {
            Serial.println("MQTT: Command CLOSE WINDOW");
            controlWindowServo(true);  // true để ĐÓNG cửa sổ
            isServoWindowOpen = false; // Cập nhật trạng thái: Cửa sổ ĐÃ ĐÓNG
            //mqttWindowOverride = true; // Đặt cờ ưu tiên MQTT
        } else {
            Serial.println("Unknown window servo command.");
            Serial.println(message);
        }
    }
    else {
        Serial.println("Topic not handled by this callback.");

    }
}

void handleRFID() {
    if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        if (lastUid != "") { 
            lastUid = "";
        }
        delay(50);
    return;
    }

    String currentUid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) { currentUid += "0"; }
        currentUid += String(rfid.uid.uidByte[i], HEX);
    }
    currentUid.toUpperCase();

    if (currentUid != lastUid) {
        Serial.print("Mã thẻ (UID) : ");
        Serial.print(currentUid);

        if (isCardAuthorized(currentUid)) {
            Serial.println(" -> Mã thẻ hợp lệ ");
            controlDoorServo(!isServoDoorOpen);

            if (client.connected()) {
                if (client.publish(MQTT_AUTH_TOPIC, currentUid.c_str(), true)) {
                    Serial.println("UID được ủy quyền đã được gửi tới MQTT.");
                } else {
                    Serial.println("Xuất bản MQTT không thành công cho UID!");
                }
            } else {
                Serial.println("MQTT không được kết nối. Không thể gửi UID đã được ủy quyền.");
            }
        } else {
            Serial.println("Mã thẻ không hợp lệ ->Mày là ai???");
            String notificationMessage = "statusrfid";
            notificationMessage += "notvalid";
            publishNotification(notificationMessage);
        }
        lastUid = currentUid; 
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}

void handleRainSensor() {

    if (millis() - lastRainCheckTime < rainCheckInterval) {
        return;
    }
    lastRainCheckTime = millis();
    int rainSensorValue = digitalRead(PIN_SENSOR_RAIN);
    bool isRaining = (rainSensorValue == HIGH);
    // Logic điều khiển servo cửa sổ dựa trên mưa
    // isRaining = true (có mưa) => ĐÓNG cửa sổ (controlWindowServo(true))
    // isRaining = false (hết mưa) => MỞ cửa sổ (controlWindowServo(false))
    if (isRaining) {
          if (isServoWindowOpen) { // Nếu trời mưa VÀ cửa sổ đang mở
             Serial.println("Cảm biến: Phát hiện mưa! Đang đóng cửa sổ.");
             controlWindowServo(true); // true để ĐÓNG cửa sổ
             isServoWindowOpen = false;
        }
    } 
  
    if (isRaining != Previousrainsensor) { 
       publishRainDetectedState(isRaining);
       Previousrainsensor = isRaining; // Cập nhật trạng thái mưa trước đó
    }
}

bool isCardAuthorized(const String& uid) {
    for (int i = 0; i < NUM_AUTHORIZED_CARDS; i++) {
        if (uid.equalsIgnoreCase(authorizedUIDs[i])) {
            return true;
        }
    }
    return false;
}

bool setup_wifi() {
    delay(10); Serial.println(); Serial.print("Connecting to WiFi ["); Serial.print(ssid); Serial.print("]...");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    int attempts = 0; const int maxAttempts = 30;
    while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
        delay(500); Serial.print("."); attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ Connected to WiFi!");
        Serial.print("IP address: "); Serial.println(WiFi.localIP());
        return true;
    } else {
        Serial.println("\n❌ Failed to connect to WiFi after multiple attempts!");
        WiFi.disconnect(true);
        WiFi.mode(WIFI_OFF);
        return false;
    }
}

bool reconnect_mqtt() {
    if (!client.connected() && WiFi.status() == WL_CONNECTED) {
        Serial.print("Attempting MQTT connection...");
        if (client.connect(clientID, mqttUser, mqttPassword)) {
            Serial.println("\n✅ MQTT connected successfully!");
            if(client.subscribe(MQTT_SERVO_DOOR_COMMAND_TOPIC)){ 
                Serial.print("Subscribed to door servo command topic: ");
                Serial.println(MQTT_SERVO_DOOR_COMMAND_TOPIC); 
            } else {
                Serial.println("Failed to subscribe to door servo command topic!");
            }
            
            if(client.subscribe(MQTT_SERVO_WINDOW_COMMAND_TOPIC)){
                Serial.print("Subscribed to window servo command topic: ");
                Serial.println(MQTT_SERVO_WINDOW_COMMAND_TOPIC);
            } else {
                Serial.println("Failed to subscribe to window servo command topic!");
            }

            publishDoorServoState();
            publishWindowServoState(); 
            publishRainDetectedState(digitalRead(PIN_SENSOR_RAIN) == LOW); 
        } else {
            Serial.print("\n❌ MQTT Failed, rc="); Serial.print(client.state()); Serial.println(". Retrying in 5 seconds...");
            return false;
        }
    }
    return client.connected();
}

void printHex(byte *buffer, byte bufferSize) {
    for (byte i = 0; i < bufferSize; i++) {
        Serial.print(buffer[i] < 0x10 ? " 0" : " ");
        Serial.print(buffer[i], HEX);
    }
}