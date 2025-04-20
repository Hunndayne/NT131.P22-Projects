#include "esp_camera.h"
#include <WiFi.h>
#include <PubSubClient.h> // Include the PubSubClient library

// --- Cấu hình điều khiển đèn LED Flash ---
#define LED_FLASH_PIN 4   // Chân GPIO nối với đèn LED Flash trên bo mạch AI Thinker ESP32-CAM
// --- Kết thúc cấu hình đèn ---

// Select Your Camera Board
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// WiFi credentials
const char* ssid = "hunn";
const char* password = "28112005";

// MQTT Broker details
#define CONFIG_BROKER_URL       "mqtt.home.hunn.io.vn"
#define CONFIG_BROKER_PORT      1883
#define CONFIG_BROKER_USERNAME  "hunn"
#define CONFIG_BROKER_PASSWORD  "28112005"

// Device and topic definitions for MQTT
#define ESP32CAM_DEVICE         "esp32cam1"
#define ESP32CAM_PUBLISH_TOPIC  "esp32cam/image"

// MQTT Client Buffer Size for PubSubClient
// *** OPTIMIZED: Reduced buffer size as images will be smaller without PSRAM ***
const uint16_t bufferSize = 1024 * 20; // 20KB (Adjust if needed based on actual image sizes)

WiFiClient net;
PubSubClient client(net);

// WiFi Event Handler (remains the same)
void WiFiEvent(WiFiEvent_t event) { // Using the newer WiFiEvent_t type
  Serial.printf("[WiFi Event] event: %d\n", event);
  switch (event) {
    // Use the event names suggested by the compiler
    case IP_EVENT_STA_GOT_IP: // Correct event name for getting IP
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      break;
    case WIFI_EVENT_STA_DISCONNECTED: // Correct event name for disconnection
      Serial.println("WiFi lost connection");
      // Optional: Add reconnection logic if needed, though MQTT reconnect handles some cases
      break;
    default:
      break;
  }
}

// Initialize WiFi (remains the same)
void setup_wifi() {
    WiFi.onEvent(WiFiEvent); // Register the event handler
    Serial.print(" Connecting to WiFi...");
    WiFi.begin(ssid, password);
    int timeout = 20; // 10 seconds timeout (20 * 500ms)
    while (WiFi.status() != WL_CONNECTED && timeout > 0) {
        delay(500);
        Serial.print(".");
        timeout--;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" ✅ Connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println(" ❌ Failed to connect WiFi!");
        Serial.println("Restarting in 5 seconds...");
        delay(5000);
        ESP.restart();
    }
}

// Connect to the MQTT broker using PubSubClient logic (remains the same)
void connectMQTT() {
  Serial.print("Attempting MQTT connection...");
  unsigned long startAttemptTime = millis();
  while (!client.connected()) {
    // Give up and restart after 30 seconds
    if (millis() - startAttemptTime > 30000) {
        Serial.println(" Failed to connect MQTT after 30s. Restarting...");
        delay(1000);
        ESP.restart();
    }
    Serial.print(".");
    // Attempt to connect
    // Provide client ID, username, and password
    if (client.connect(ESP32CAM_DEVICE, CONFIG_BROKER_USERNAME, CONFIG_BROKER_PASSWORD)) {
      Serial.println("\nMQTT connected!");
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state()); // Print the reason for failure
      Serial.println(" try again in 2 seconds");
      delay(2000); // Wait 2 seconds before retrying
    }
  }
}

// Initialize the camera
bool camInit() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG; // Use JPEG format
  config.grab_mode    = CAMERA_GRAB_LATEST; // Grabs the latest frame, discarding older ones

  if (psramFound()) {
    Serial.println("PSRAM Found. Using default settings (VGA, Quality 15, fb_count=2).");
    config.frame_size = FRAMESIZE_VGA;    // Higher resolution with PSRAM
    config.jpeg_quality = 15;             // Moderate quality
    config.fb_location = CAMERA_FB_IN_PSRAM; // Use PSRAM for frame buffer
    config.fb_count = 2;                  // Use 2 frame buffers for smoother capture
  } else {
    // *** OPTIMIZED SETTINGS FOR NO PSRAM ***
    Serial.println("PSRAM Not Found. Using lower settings (QVGA, Quality 25) in DRAM.");
    config.frame_size = FRAMESIZE_QVGA;   // *** Lower resolution (320x240) ***
    config.jpeg_quality = 25;             // *** Lower quality (higher value = smaller file) ***
    config.fb_location = CAMERA_FB_IN_DRAM;  // Use limited internal DRAM
    config.fb_count = 1;                  // *** Must use only 1 buffer in DRAM ***
  }

  // Initialize Camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x Trying again...\n", err);
    // Add a small delay before retrying
    delay(1000);
    err = esp_camera_init(&config); // Retry initialization
     if (err != ESP_OK) {
       Serial.printf("Camera init retry failed with error 0x%x\n", err);
       return false; // Return false if retry also fails
     }
  }
  Serial.println("Camera Initialized Successfully.");
  return true; // Return true on successful initialization
}

// Capture image and send it via MQTT (LED control remains external)
void uploadImage() {
  camera_fb_t* fb = NULL; // Pointer to the frame buffer

  Serial.println("Capturing image...");
  fb = esp_camera_fb_get(); // Capture image

  if (!fb) {
    Serial.println("Camera capture failed");
    // Optional: could try to re-initialize camera or restart here after several failures
    return; // Exit the function if capture failed
  }

  Serial.printf("Image captured: Size = %u bytes, Format = %d\n", fb->len, fb->format);

  // Check if format is JPEG (it should be based on config)
  if (fb->format != PIXFORMAT_JPEG) {
    Serial.println("Error: Image format is not JPEG.");
    esp_camera_fb_return(fb); // Return buffer even if format is wrong
    return;
  }

  // Check if image size exceeds MQTT buffer (with a small safety margin)
  // Crucial for preventing PubSubClient buffer overflows
  if (fb->len > bufferSize - 100) { // Leave 100 bytes margin
      Serial.printf("[ERROR] Image size (%u bytes) too large for MQTT buffer (%d bytes). Cannot send.\n", fb->len, bufferSize);
      Serial.println("Try increasing jpeg_quality (lower quality) or reducing resolution further.");
      esp_camera_fb_return(fb); // Return the buffer
      return; // Do not attempt to publish
  }

  // Publish the image if MQTT is connected
  if (client.connected()) {
      Serial.printf("Publishing image (%u bytes) to topic '%s'...", fb->len, ESP32CAM_PUBLISH_TOPIC);
      // Publish: topic, payload buffer, payload length, retained flag (false)
      if (client.publish(ESP32CAM_PUBLISH_TOPIC, fb->buf, (unsigned int)fb->len, false)) {
        Serial.println(" Success.");
      } else {
        Serial.print(" FAILED. PubSubClient State: ");
        Serial.println(client.state());
        // Consider what to do on failure - maybe retry later?
      }
  } else {
      Serial.println("MQTT not connected. Cannot publish image.");
  }


  // IMPORTANT: Return the frame buffer memory once done
  esp_camera_fb_return(fb);
  // A small delay might help stability after returning buffer, though not strictly necessary
  // delay(100);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n--- ESP32-CAM MQTT Publisher (PubSubClient) + LED Flash Always ON (Optimized for No PSRAM) ---");
  Serial.println("Reminder: Ensure adequate 5V power supply!");
  delay(1000); // Wait a bit for serial monitor

  // --- Khởi tạo chân điều khiển đèn LED Flash ---
  pinMode(LED_FLASH_PIN, OUTPUT);
  digitalWrite(LED_FLASH_PIN, LOW); // Đảm bảo đèn tắt ban đầu
  Serial.println("LED Flash pin initialized.");
  // ---                                           ---

  // Initialize Camera
  if (!camInit()) {
    Serial.println("FATAL: Camera Initialization Failed. Restarting...");
    delay(5000);
    ESP.restart();
  }

  // Initialize WiFi
  setup_wifi();

  // Configure MQTT Client
  client.setServer(CONFIG_BROKER_URL, CONFIG_BROKER_PORT);
  client.setBufferSize(bufferSize); // Set the buffer size
  // client.setCallback(callback); // Uncomment if you need to receive MQTT messages

  // Connect to MQTT Broker
  connectMQTT();

  // --- Bật đèn LED Flash liên tục sau khi mọi thứ sẵn sàng ---
  Serial.println("Turning LED Flash ON permanently.");
  digitalWrite(LED_FLASH_PIN, HIGH); // Turn the flash ON
  // ---                                                 ---

  Serial.println("Setup Complete. Starting main loop...");
}

void loop() {
  // Maintain MQTT Connection
  if (!client.connected()) {
      Serial.println("MQTT Disconnected. Attempting reconnection...");
      connectMQTT(); // Attempt to reconnect
      // Re-assert LED state after successful reconnection (in case of restart/power flicker)
      if(client.connected()) {
          digitalWrite(LED_FLASH_PIN, HIGH);
          Serial.println("MQTT reconnected. LED state confirmed ON.");
      }
  }
  // IMPORTANT: Allow the MQTT client to process incoming messages and maintain connection
  client.loop();

  // Send image only if MQTT is connected
  if (client.connected()) {
      uploadImage(); // Capture and upload
  } else {
      Serial.println("Cannot upload image, MQTT not connected.");
      // Optional: Add a longer delay here if MQTT is down to avoid spamming logs
      // delay(5000);
  }

  // *** OPTIMIZED: Increased delay between captures ***
  Serial.println("Waiting 2000 ms before next capture...");
  delay(500); // Wait 2 seconds before the next cycle
  
}

// Optional: Callback function for handling received MQTT messages with PubSubClient
/*
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  payload[length] = '\0'; // Add null terminator IF payload is expected to be string
  Serial.println((char*)payload);
  // Add code here to handle commands received via MQTT
  // Example: Turn LED off/on based on payload
  // if (strcmp((char*)payload, "LED_OFF") == 0) {
  //   digitalWrite(LED_FLASH_PIN, LOW);
  // } else if (strcmp((char*)payload, "LED_ON") == 0) {
  //   digitalWrite(LED_FLASH_PIN, HIGH);
  // }
}
*/