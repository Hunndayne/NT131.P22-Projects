# Ngôi Nhà Thông Minh (Smart Home)

Dự án "Ngôi Nhà Thông Minh" nhằm mục đích xây dựng một hệ thống tự động hóa và điều khiển các thiết bị trong nhà, mang lại sự tiện nghi, an toàn và tiết kiệm năng lượng. 

## Giới thiệu

Trong cuộc sống hiện đại, con người ngày càng quan tâm đến sự tiện nghi, an toàn và tiết kiệm năng lượng trong sinh hoạt hằng ngày.  Nhu cầu thực tế bao gồm quản lý thiết bị điện trong nhà từ xa, tự động hóa sinh hoạt, tiết kiệm điện năng và nâng cao hiệu quả sử dụng thiết bị, cũng như đáp ứng nhu cầu tiện nghi và nâng cao chất lượng cuộc sống. 

### Mục tiêu của dự án:
* Xây dựng mô hình nhà thông minh thu nhỏ có khả năng điều khiển và giám sát thiết bị trong nhà. 
* Thiết kế hệ thống điều khiển sử dụng vi điều khiển và cảm biến để theo dõi và tự động hóa các thiết bị như đèn, cửa, v.v. 
* Thiết kế giao diện điều khiển trực quan trên điện thoại hoặc máy tính giúp người dùng dễ dàng tương tác và theo dõi trạng thái thiết bị.

## Thành viên nhóm

Dự án được thực hiện bởi Nhóm 3 của Trường Đại học Công nghệ - Thông tin - DHQG TPHCM, dưới sự hướng dẫn của GVHD: Lê Anh Tuấn.
* Trần Thanh Hùng - 23520580 
* Đỗ Thái Hậu - 23520450 
* Nguyễn Trung Hiếu - 23520487 
* Nguyễn Thái Bảo Châu - 23520173
## Tính năng

Hệ thống nhà thông minh này cung cấp các tính năng chính sau:

* **Điều khiển đèn:** Bật/tắt đèn trong các khu vực như phòng khách, phòng bếp, phòng ngủ thông qua giao diện web hoặc Google Home. 
* **Điều khiển cửa ra vào và cửa sổ:** Điều khiển mở/đóng cửa chính và cửa sổ. 
* **Giám sát môi trường:**
    * **Nhiệt độ và độ ẩm:** Theo dõi nhiệt độ và độ ẩm không khí trong nhà. 
    * **Khí gas:** Phát hiện rò rỉ khí gas và cảnh báo khi nồng độ vượt ngưỡng an toàn.
    * **Nước mưa:** Phát hiện nước mưa và tự động đóng cửa sổ. 
* **Xác thực người dùng:** Sử dụng thẻ từ RFID để kiểm soát quyền truy cập cửa chính. Hệ thống kiểm tra mã thẻ hợp lệ và gửi thông báo nếu thẻ không hợp lệ.
* **Giao diện điều khiển:**
    * **Web:** Giao diện web được phát triển bằng ReactJS, cho phép người dùng thực hiện đầy đủ các thao tác điều khiển và theo dõi trạng thái thiết bị. 
    * **Google Home:** Điều khiển hệ thống thông qua Google Home và đồng bộ hóa với Google Assistant. 
* **Tiết kiệm điện năng:** Tối ưu hóa việc sử dụng thiết bị để giảm tiêu thụ điện năng.

## Phần cứng

Các thành phần phần cứng chính được sử dụng trong dự án bao gồm:

* **ESP32:** Là vi điều khiển tích hợp Wi-Fi và Bluetooth, đóng vai trò bộ não trung tâm của hệ thống nhà thông minh. ESP32 tiếp nhận dữ liệu từ cảm biến (nhiệt độ, độ ẩm, khí gas,...), xử lý tín hiệu và đưa ra hành động tương ứng (bật/tắt đèn, đóng/mở cửa,...), đồng thời giao tiếp với người dùng qua kết nối Wi-Fi để truyền/nhận lệnh điều khiển từ giao diện.
* **Cảm biến nước:** Dùng để phát hiện sự xuất hiện của nước. Khi có nước, cảm biến sẽ gửi tín hiệu điện đến hệ thống để thông báo. 
* **Cảm biến nhiệt độ - độ ẩm (DHT11):** Là thiết bị đo nhiệt độ và độ ẩm không khí trong môi trường xung quanh và gửi dữ liệu về hệ thống.
* **Cảm biến khí gas (MQ-2):** Là thiết bị dùng để phát hiện sự hiện diện của các loại khí dễ cháy trong không khí. Khi nồng độ khí vượt ngưỡng an toàn, cảm biến sẽ gửi tín hiệu cảnh báo đến hệ thống. 
* **Đèn LED:** Là loại diode phát sáng khi có dòng điện chạy qua. Nhờ tiêu thụ điện năng thấp, tuổi thọ cao và kích thước nhỏ gọn, LED được sử dụng rộng rãi trong các thiết bị điện tử và hệ thống điều khiển.
* **Servo Motor:** Là động cơ có khả năng điều khiển vị trí chính xác dựa trên tín hiệu điều khiển. Nó thường được dùng trong các hệ thống tự động để điều khiển các chuyển động như mở cửa, xoay camera, hoặc điều khiển cánh tay robot. 
* **Thẻ từ (RFID MFRC522):** Là loại thẻ không tiếp xúc, hoạt động ở tần số 13.56 MHz, thường dùng trong các hệ thống như kiểm soát ra vào. Thẻ giao tiếp với đầu đọc MFRC522 thông qua sóng radio để lưu trữ và truyền dữ l Chức năng chính của nó là xác thực người dùng, kiểm soát truy cập, lưu trữ và truyền dữ liệu không dây, hỗ trợ đọc và ghi dữ liệu. 

## Phần mềm

Dự án sử dụng các công nghệ phần mềm sau:

* **Web (Giao diện người dùng):**
    * **Mô hình hoạt động:** Sử dụng kiến trúc MQTT và Express JS. 
    * **Giao thức kết nối ESP32 và server:** Các thiết bị ESP32 nhận tín hiệu điều khiển và gửi dữ liệu thông qua giao thức MQTT. MQTT (Message Queuing Telemetry Transport) là giao thức nhắn tin, mã nguồn mở, truyền tải dữ liệu giữa các thiết bị trong môi trường có tài nguyên và băng thông hạn chế, đặc biệt là trong Internet of Things (IoT). 
        * Các thành phần chính trong kiến trúc MQTT bao gồm: Publisher, Subscriber và Broker (Trung gian). 
    * **Server:**
        * Backend và MQTT Subscriber, MQTT Publisher. 
        * API cho nền tảng Web. 
        * Lưu trữ dữ liệu và logs của các thiết bị. 
        * Kết nối với Google Home. 
        * Thực hiện các Automation. 
    * **Database:** Sử dụng MongoDB để lưu trữ dữ liệu về thông tin người dùng, dữ liệu cảm biến và logs của các thiết bị. 
    * **Client:** Phía Client để điều khiển có thể điều khiển thông qua giao diện web. Giao diện web được nhóm phát triển sử dụng thư viện ReactJS. Chức năng của giao diện web là cho phép người dùng thực hiện đầy đủ các thao tác điều khiển, theo dõi trạng thái thiết bị. Người dùng cũng có thể điều khiển hệ thống thông qua Google Home. 
* **Arduino IDE:** Môi trường lập trình cho ESP32.
    * **Hàm kết nối Wifi:** Mã `setup_wifi()` để kết nối ESP32 với mạng Wi-Fi. 
    * **Hàm kết nối tới MQTT:** Mã `reconnect()` để kết nối với MQTT Broker, bao gồm cấu hình server, port, user và password. 
    * **MQTT Topic:** Định nghĩa các topic cho các cảm biến và thiết bị điều khiển (ví dụ: `Kitchen/Sensor/Gas`, `Livingroom/Lights`, `Home/Sensor/Humidity`, `esp32/rfid/authorized_uid`, `esp32/servo_door/command`). 
    * **Xử lí tín hiệu bật tắt đèn:** Logic xử lý tin nhắn MQTT nhận được để bật/tắt đèn phòng khách, bếp, ngủ. 
    * **Gửi dữ liệu nhiệt độ - độ ẩm lên MQTT:** Hàm `publishDHTData()` đọc giá trị nhiệt độ và độ ẩm từ cảm biến DHT và gửi lên MQTT định kỳ. 
    * **Giám sát và cảnh báo khí gas:** Logic kiểm tra giá trị từ cảm biến khí gas và gửi cảnh báo "gas_detected" hoặc "no_gas" lên MQTT. 
    * **Cảm biến thẻ từ đóng mở cửa chính:** Logic kiểm tra mã thẻ từ, xác thực và điều khiển servo cửa, đồng thời gửi thông báo lên MQTT. 
    * **Cảm biến nước mưa - Đóng/mở cửa sổ:** Logic kiểm tra trạng thái cảm biến nước mưa và điều khiển servo cửa sổ (mở/đóng).

## Triển khai

Phần triển khai bao gồm sơ đồ mạch điện và demo hoạt động của mô hình:

* **Sơ đồ mạch điện:** Chi tiết kết nối các cảm biến (khí gas, nhiệt độ/độ ẩm, thẻ từ, nước) và thiết bị điều khiển (đèn) với ESP32. 
* **Demo:** Trình bày hoạt động thực tế của hệ thống.

## Hướng phát triển tương lai

Dự án có tiềm năng phát triển với các hướng sau:

* **Nâng cấp phần cứng:** Sử dụng các thiết bị, cảm biến tốt hơn để chính xác hơn và bền bỉ hơn. 
* **Quản lý thành viên và phân quyền:** Phát triển tính năng quản lý danh sách thành viên, phân quyền điều khiển khác nhau với mỗi thành viên. 
* **Ứng dụng di động:** Phát triển ứng dụng di động với các tính năng như:
    * Giám sát nhiệt độ, độ ẩm, khí gas theo thời gian thực. 
    * Nhận thông báo đẩy khi có rò rỉ gas, mưa, hoặc có người mở cửa. 
    * Điều khiển từ xa các thiết bị: đèn, cửa sổ, cửa chính,... 
* **Khả năng mở rộng các thiết bị:** Nếu có thiết bị mới thì người dùng có thể thực hiện cấu hình dễ dàng trên app hoặc web.
* **Tích hợp trí tuệ nhân tạo (AI) nâng cao:**
    * Sử dụng AI nhận diện khuôn mặt để mở cửa tự động cho các thành viên trong gia đình.
    * Học theo thói quen sử dụng của người dùng để tạo các tự động hóa. 
* **Mở rộng hệ thống cảm biến và thiết bị điều khiển:**
    * Cảm biến chuyển động: tự động bật/tắt đèn khi có người trong phòng. 
    * Camera an ninh IP: truyền hình ảnh trực tiếp về điện thoại/web. 
* **Nâng cao bảo mật và an toàn hệ thống:**
    * Thêm tính năng xác thực hai bước (2FA) khi đăng nhập hoặc điều khiển từ xa.
    * Gửi cảnh báo khi có truy cập bất thường hoặc có người lạ mở cố cửa. 


## Cài đặt và Chạy

Để triển khai và chạy dự án này, bạn cần thiết lập ba phần chính: phần cứng ESP32, backend (server) và frontend (web).

### 1. Thiết lập ESP32

1.  **Cài đặt Arduino IDE:** Tải và cài đặt Arduino IDE từ trang chủ của Arduino.
2.  **Cài đặt ESP32 Board Manager:**
    * Trong Arduino IDE, vào `File > Preferences`.
    * Thêm URL sau vào "Additional Boards Manager URLs": `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
    * Vào `Tools > Board > Boards Manager...`, tìm kiếm "ESP32" và cài đặt gói `esp32` của Espressif.
3.  **Cài đặt thư viện cần thiết:**
    * Trong Arduino IDE, vào `Sketch > Include Library > Manage Libraries...`.
    * Tìm và cài đặt các thư viện sau:
        * `PubSubClient` (cho MQTT)
        * `DHT sensor library` (cho cảm biến nhiệt độ - độ ẩm)
        * `MFRC522` (cho RFID)
        * `ESP32Servo` (cho Servo Motor)
4.  **Cấu hình Wi-Fi và MQTT:**
    * Mở file `.ino` của dự án trong Arduino IDE (thường nằm trong thư mục `Firmware` hoặc `ESP32_Code`).
    * Thay đổi `ssid` và `password` trong hàm `setup_wifi()` thành tên mạng và mật khẩu Wi-Fi của bạn[cite: 51].
    * Kiểm tra `mqtt_server`, `mqtt_port`, `mqttUser`, `mqttPassword` trong hàm `reconnect()` để đảm bảo chúng khớp với cấu hình MQTT Broker của bạn[cite: 54, 55].
5.  **Nạp mã lên ESP32:**
    * Kết nối ESP32 với máy tính.
    * Chọn đúng board ESP32 và cổng COM trong `Tools > Board` và `Tools > Port`.
    * Nhấn nút "Upload" để nạp mã.

### 2. Thiết lập Backend (Server)

Dự án sử dụng Node.js với Express.js và MongoDB.

1.  **Cài đặt Node.js và npm:** Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) và npm (Node Package Manager) trên máy tính của mình.
2.  **Cài đặt MongoDB:** Tải và cài đặt [MongoDB Community Server](https://www.mongodb.com/try/download/community) và [MongoDB Compass](https://www.mongodb.com/products/compass) (tùy chọn để quản lý database dễ dàng hơn). Đảm bảo MongoDB server đang chạy.
3.  **Clone repository:**
    ```bash
    git clone https://github.com/Hunndayne/NT131.P22-Projects.git
    cd NT131.P22-Projects
    ```
4.  **Di chuyển vào thư mục backend:**
    ```bash
    cd server # Hoặc tên thư mục chứa mã backend của bạn
    ```
5.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```
6.  **Cấu hình môi trường:** Tạo một file `.env` trong thư mục backend và thêm các biến môi trường cần thiết, ví dụ:
    ```dotenv
    MONGO_URI=mongodb://localhost:27017/smarthome # Hoặc chuỗi kết nối MongoDB của bạn
    MQTT_BROKER_URL=mqtt://mqtt.home.hunn.io.vn:1883 # Hoặc địa chỉ MQTT Broker của bạn
    MQTT_USERNAME=hunn
    MQTT_PASSWORD=28112005 
    PORT=3000 
    ```
    *Lưu ý:* `mqtt.home.hunn.io.vn` là địa chỉ MQTT Broker được sử dụng trong bài thuyết trình. Bạn cần đảm bảo địa chỉ này có thể truy cập được hoặc thay thế bằng một MQTT Broker khác (ví dụ: [Mosquitto](https://mosquitto.org/) trên localhost.
7.  **Khởi chạy server:**
    ```bash
    npm start
    ```
    Server sẽ chạy trên cổng được cấu hình (mặc định là 3000).

### 3. Thiết lập Frontend (Webapp)

Giao diện người dùng được phát triển bằng ReactJS.

1.  **Di chuyển vào thư mục webapp:**
    ```bash
    cd webapp # Di chuyển vào thư mục chứa mã frontend của bạn
    ```
2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```
3.  **Cấu hình API endpoint:**
    * Mở file cấu hình cho API endpoint trong thư mục `webapp`. Thông thường, đây là file `src/config.js`.
    * Đảm bảo rằng URL của API backend được thiết lập chính xác. Ví dụ:
        ```javascript
        // src/config.js (Ví dụ)
        const API_BASE_URL = 'http://localhost:3000/api'; // Thay đổi nếu backend chạy trên cổng khác
        export default API_BASE_URL;
        ```
    * Nếu bạn đang sử dụng biến môi trường trong React app (ví dụ: thông qua `create-react-app`), bạn có thể cần tạo file `.env.local` hoặc `.env` trong thư mục `webapp` và thêm biến môi trường:
        ```dotenv
        REACT_APP_API_BASE_URL=http://localhost:3000/api
        ```
        Sau đó truy cập biến này trong code bằng `process.env.REACT_APP_API_BASE_URL`.
4.  **Khởi chạy ứng dụng web:**
    ```bash
    npm start
    ```
    Ứng dụng web sẽ mở trong trình duyệt của bạn (thường là `http://localhost:5173`).

Sau khi hoàn tất các bước trên, bạn có thể tương tác với hệ thống nhà thông minh thông qua giao diện web hoặc Google Home (nếu đã tích hợp và cấu hình thành công).

---
