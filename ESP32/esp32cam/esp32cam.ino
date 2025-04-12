/////////////////////////////////////////////////////////////////
// Home Assistant with multiple ESP32 Cameras! (Part 2)
// For More Information: https://youtu.be/MjZjyK1WgjY
// Updated for latest ESP32 Arduino Core event names
/////////////////////////////////////////////////////////////////

#include "esp_camera.h"
#include <WiFi.h>
#include <MQTT.h>

// Select Your Camera Board
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// WiFi credentials
const char* ssid = "hunn";
const char* password = "28112005";

// MQTT Broker details
#define CONFIG_BROKER_URL       "mqtt.home.hunn.io.vn"
#define CONFIG_BROKER_USERNAME  "hunn"
#define CONFIG_BROKER_PASSWORD  "28112005"

// Device and topic definitions for MQTT
#define ESP32CAM_DEVICE         "esp32cam1"
#define ESP32CAM_PUBLISH_TOPIC  "esp32cam/image"

const int bufferSize = 1024 * 25;  // 25KB

WiFiClient net;
MQTTClient client(bufferSize);

// Updated WiFi event callback with two parameters
void onWiFiEvent(WiFiEvent_t event, WiFiEventInfo_t info) {
  switch (event) {
    case IP_EVENT_STA_GOT_IP:
      Serial.print("WiFi connected! IP: ");
      Serial.println(WiFi.localIP());
      break;
    case WIFI_EVENT_STA_DISCONNECTED:
      Serial.println("WiFi lost connection");
      // Optionally, reconnect or handle disconnect here
      break;
    default:
      break;
  }
}

// Initialize WiFi using the new event handling
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

// Connect to the MQTT broker
void connectMQTT() {
  Serial.print("Connecting to MQTT");
  while (!client.connect(ESP32CAM_DEVICE, CONFIG_BROKER_USERNAME, CONFIG_BROKER_PASSWORD)) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nMQTT connected!");
}

// Initialize the camera with updated settings
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
  config.frame_size   = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;  // JPEG for streaming
  config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location  = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count     = 1;

  // Adjust settings based on available PSRAM
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
      config.frame_size = FRAMESIZE_VGA;
    } else {
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    config.frame_size = FRAMESIZE_VGA;
  #if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
  #endif
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return false;
  }
  return true;
}

// Capture image and send it via MQTT
void uploadImage() {
  Serial.println("Uploading image via MQTT");
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  
  if (fb->format != PIXFORMAT_JPEG) {
    Serial.println("Non-JPEG format not supported");
    esp_camera_fb_return(fb);
    return;
  }
  
  if (!client.publish(ESP32CAM_PUBLISH_TOPIC, (const char*)fb->buf, fb->len)) {
    Serial.println("[Failure] Failed to upload image via MQTT");
  }
  
  esp_camera_fb_return(fb);
}

void setup() {
  Serial.begin(115200);
  if (!camInit()) {
    Serial.println("[Failure] Camera Initialization");
    return;
  }
  setup_wifi();
  client.begin(CONFIG_BROKER_URL, 1883, net);
  
  connectMQTT();
}

void loop() {
  client.loop();
  delay(10);
  
  if (!client.connected()) {
    connectMQTT();
  } else {
    uploadImage();
  }
}
