#include "esp_camera.h"
#include <WiFi.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "Arduino.h"
#include "fb_gfx.h"
#include "soc/soc.h"          // disable brownout problems
#include "soc/rtc_cntl_reg.h" // disable brownout problems
#include "esp_http_server.h"
#include "Arduino.h"

// Replace with your network credentials
const char *ssid = "TUP_Robot";        // 你的WiFi名称
const char *password = "12345678"; // 你的WiFi密码

#define PART_BOUNDARY "123456789000000000000987654321"

#define CAMERA_MODEL_AI_THINKER


#if defined(CAMERA_MODEL_AI_THINKER)
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27

#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

#else
#error "Camera model not selected"
#endif

#define MOTOR_1_PIN_1 14
#define MOTOR_1_PIN_2 15
#define MOTOR_2_PIN_1 13
#define MOTOR_2_PIN_2 12

static const char *_STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char *_STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char *_STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

httpd_handle_t camera_httpd = NULL;
httpd_handle_t stream_httpd = NULL;

static const char PROGMEM INDEX_HTML[] = R"rawliteral(
<html>
  <head>
    <title>TUP_Robot</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: Arial;
        text-align: center;
        margin: 0px auto;
        padding-top: 30px;
      }
      table {
        margin-left: auto;
        margin-right: auto;
      }
      td {
        padding: 8px;
      }
      .button {
        background-color: #2f4468;
        border: none;
        color: white;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 18px;
        margin: 6px 3px;
        cursor: pointer;
        user-select: none;
      }
      img {
        width: auto;
        max-width: 100%;
        height: auto;
      }
      /* 红点的样式 */
      #redDot {
        width: 20px;
        height: 20px;
        background-color: black; /* 默认颜色为黑色 */
        border-radius: 50%; /* 使其为圆形 */
        margin: 10px auto; /* 上下有间隔，居中 */
      }
    </style>
  </head>
  <body>
    <h1>SH-TUP Robot</h1>
    <div id="redDot"></div> <!-- 嵌入小红点，放在标题下方 -->

    <img src="" id="photo" style="transform: rotate(180deg);"/> 

    <canvas id="joystick" width="300" height="300" style="border:1px solid #ffffff;"></canvas>

    <!-- 新增按钮 -->
    <button id="pressButton" class="button">LED</button>

    <script>
      var canvas = document.getElementById('joystick');
      var ctx = canvas.getContext('2d');
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = 100;
      var isDragging = false;

      function drawJoystick(x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false); // 绘制外圈
        ctx.fillStyle = '#ccc';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2, false); // 绘制摇杆
        ctx.fillStyle = 'blue';
        ctx.fill();
      }

      var lastSentTime = 0; // 上一次发送指令的时间
      var sendInterval = 100; // 发送指令的间隔

      function startDrag(e) {
        isDragging = true;
        moveJoystick(e);
      }

      function endDrag() {
        isDragging = false;
        resetJoystick();
      }

      function moveJoystick(e) {
        var rect = canvas.getBoundingClientRect();
        var x, y;

        // 检测鼠标和触摸事件
        if (e.touches) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
        } else {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        }

        // 计算摇杆偏移
        var deltaX = x - centerX;
        var deltaY = y - centerY;
        
        // 限制摇杆的移动范围
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > radius) {
          var angle = Math.atan2(deltaY, deltaX);
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }
        
        drawJoystick(x, y);
        
        // 使用定时器控制指令发送频率
        var currentTime = Date.now();
        if (currentTime - lastSentTime > sendInterval) {
            sendCommand(deltaX, deltaY); // 发送指令
            lastSentTime = currentTime; // 更新上次发送时间
        }
      }

      function resetJoystick() {
        drawJoystick(centerX, centerY); // 重置摇杆位置
        sendCommand(0, 0); // 停止指令
      }

      function sendCommand(deltaX, deltaY) {
        // 限制每次至少发送一次数据，避免摇杆不动也不发送
        var command;
        if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              if(deltaX > 50) {
                command = 'right';
              } else if(deltaX < -50) {
                command = 'left';
              }
            } else {
              if(deltaY > 50) {
                command = 'backward';
              } else if(deltaY < -50) {
                command = 'forward';
              }
            }
        } else {
            command = 'stop'; // 停止
        }
        console.log(command);
        console.log(deltaX, deltaY);

        // 发送指令
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/action?go=" + command, true);
        xhr.send();
      }
      // 事件监听
      canvas.addEventListener("mousedown", startDrag);
      canvas.addEventListener("mousemove", function(e) {
        if (isDragging) {
          moveJoystick(e);
        }
      });
      canvas.addEventListener("mouseup", endDrag);
      canvas.addEventListener("mouseout", endDrag);

      // 添加触摸事件
      canvas.addEventListener("touchstart", function(e) {
        e.preventDefault(); // 防止页面滚动
        startDrag(e);
      });
      canvas.addEventListener("touchmove", function(e) {
        if (isDragging) {
          moveJoystick(e);
        }
      });
      canvas.addEventListener("touchend", endDrag);
      canvas.addEventListener("touchcancel", endDrag);
      
      // 初始化绘制
      drawJoystick(centerX, centerY);

      // LED按钮事件
      function changeRedDotColor(isPressed) {
        const redDot = document.getElementById('redDot');
        redDot.style.backgroundColor = isPressed ? 'red' : 'black'; // 根据状态改变颜色
        var led;
        if (isPressed) {
          led = 'on';
        } else {
          led = 'off';
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/action?led=" + led, true);
        xhr.send();
      }


      // 新增按钮事件监听
      const pressLED = document.getElementById("pressButton");
      pressLED.addEventListener("mousedown", function() {
          changeRedDotColor(true); // 按下时红点变红
      });
      pressLED.addEventListener("mouseup", function() {
          changeRedDotColor(false); // 松开时红点变黑
      });
      pressLED.addEventListener("mouseleave", function() {
          changeRedDotColor(false); // 离开按钮时红点变黑
      });


    </script>

    <script>


      function toggleCheckbox(x) {
        var currenTime=Date.now();
        if (currenTime - lastSentTime > sendInterval) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "/action?go=" + x, true);
          xhr.send();
          lastSentTime = currenTime; // 更新上次发送时间
        }
      }
      function stop(x) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "/action?go=" + x, true);
          xhr.send();
      }
           
      function toggleLED(x) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/action?led=" + x, true);
        xhr.send();
      }
      
      function handleKeyDown(event) {
        switch(event.key) {
          case 'w':
            toggleCheckbox('forward');
            break;
          case 'a':
            toggleCheckbox('left');
            break;
          case 's':
            toggleCheckbox('backward');
            break;
          case 'd':
            toggleCheckbox('right');
            break;
          case 'l':
            toggleLED('on');
            break;
        }
      }
      
      function handleKeyUp(event) {

        console.log("stop");
        switch(event.key)
        {
          case 'l':
            toggleLED('off');
            break;
          case 'w':
          case 'a':
          case 's':
          case 'd':
            stop('stop');
            stop('stop');
            stop('stop');
            stop('stop');

        }
      }
      
      window.onload = function() {
        document.getElementById("photo").src = window.location.href.slice(0, -1) + ":81/stream";
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
      };
    </script>
  </body>
</html>

)rawliteral";

static esp_err_t index_handler(httpd_req_t *req)
{
  httpd_resp_set_type(req, "text/html");
  return httpd_resp_send(req, (const char *)INDEX_HTML, strlen(INDEX_HTML));
}

static esp_err_t stream_handler(httpd_req_t *req)
{
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t *_jpg_buf = NULL;
  char *part_buf[64];

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if (res != ESP_OK)
  {
    return res;
  }

  while (true)
  {
    fb = esp_camera_fb_get();
    if (!fb)
    {
      Serial.println("Camera capture failed");
      res = ESP_FAIL;
    }
    else
    {
      if (fb->width > 400)
      {
        if (fb->format != PIXFORMAT_JPEG)
        {
          bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
          esp_camera_fb_return(fb);
          fb = NULL;
          if (!jpeg_converted)
          {
            Serial.println("JPEG compression failed");
            res = ESP_FAIL;
          }
        }
        else
        {
          _jpg_buf_len = fb->len;
          _jpg_buf = fb->buf;
        }
      }
    }
    if (res == ESP_OK)
    {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART,

                             _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if (res == ESP_OK)
    {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if (res == ESP_OK)
    {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen

                                  (_STREAM_BOUNDARY));
    }
    if (fb)
    {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    }
    else if (_jpg_buf)
    {
      free(_jpg_buf);
      _jpg_buf = NULL;
    }
    if (res != ESP_OK)
    {
      break;
    }
    // Serial.printf("MJPG: %uB\n",(uint32_t)(_jpg_buf_len));
  }
  return res;
}

static esp_err_t cmd_handler(httpd_req_t *req)
{
  char *buf;
  size_t buf_len;
  char variable[32] = {0,};
  char led[32]      = {0,};

  buf_len = httpd_req_get_url_query_len(req) + 1;
  if (buf_len > 1)
  {
    buf = (char *)malloc(buf_len);
    if (!buf)
    {
      httpd_resp_send_500(req);
      return ESP_FAIL;
    }
    if (httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK)
    {
      if (httpd_query_key_value(buf, "go", variable, sizeof(variable)) == ESP_OK)
      {
        //。。。。
      } else if (httpd_query_key_value(buf, "led", variable, sizeof(variable)) == ESP_OK)
      {
          // 处理LED命令
          const int ledPin = 4; // LED引脚
          pinMode(ledPin,OUTPUT);// 规定这个时输出引脚
          if (!strcmp(variable, "on")) //比较是否
          {
              digitalWrite(ledPin, HIGH);
              Serial.println("LED turned ON");//在网页中输出
          }
          else if (!strcmp(variable, "off"))
          {
              digitalWrite(ledPin, LOW);
              Serial.println("LED turned OFF");
          }
          else
          {
              free(buf);
              httpd_resp_send_404(req);
              return ESP_FAIL;
          }
      }
      else
      {
        free(buf);
        httpd_resp_send_404(req);
        return ESP_FAIL;
      }
    }
    else
    {
      free(buf);
      httpd_resp_send_404(req);
      return ESP_FAIL;
    }
    free(buf);
  }
  else
  {
    httpd_resp_send_404(req);
    return ESP_FAIL;
  }

  sensor_t *s = esp_camera_sensor_get();
  int res = 0;

  if (!strcmp(variable, "forward"))
  {
    Serial.println("Forward");
    digitalWrite(MOTOR_1_PIN_1, 1);
    digitalWrite(MOTOR_1_PIN_2, 0);
    digitalWrite(MOTOR_2_PIN_1, 1);
    digitalWrite(MOTOR_2_PIN_2, 0);
  }
  else if (!strcmp(variable, "left"))
  {
    Serial.println("Left");
    digitalWrite(MOTOR_1_PIN_1, 1);
    digitalWrite(MOTOR_1_PIN_2, 0);
    digitalWrite(MOTOR_2_PIN_1, 0);
    digitalWrite(MOTOR_2_PIN_2, 1);
  }
  else if (!strcmp(variable, "right"))
  {
    Serial.println("Right");
    digitalWrite(MOTOR_1_PIN_1, 0);
    digitalWrite(MOTOR_1_PIN_2, 1);
    digitalWrite(MOTOR_2_PIN_1, 1);
    digitalWrite(MOTOR_2_PIN_2, 0);
  }
  else if (!strcmp(variable, "backward"))
  {
    Serial.println("Backward");
    digitalWrite(MOTOR_1_PIN_1, 0);
    digitalWrite(MOTOR_1_PIN_2, 1);
    digitalWrite(MOTOR_2_PIN_1, 0);
    digitalWrite(MOTOR_2_PIN_2, 1);
  }
  else if (!strcmp(variable, "stop"))
  {
    Serial.println("Stop");
    digitalWrite(MOTOR_1_PIN_1, 0);
    digitalWrite(MOTOR_1_PIN_2, 0);
    digitalWrite(MOTOR_2_PIN_1, 0);
    digitalWrite(MOTOR_2_PIN_2, 0);
  }
  else
  {
    res = -1;
  }

  if (res)
  {
    return httpd_resp_send_500(req);
  }

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  return httpd_resp_send(req, NULL, 0);
}

void startCameraServer()
{
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  httpd_uri_t index_uri = {
      .uri = "/",
      .method = HTTP_GET,
      .handler = index_handler, //index_hadnler函数  首页的函数 句柄
      .user_ctx = NULL};

  httpd_uri_t cmd_uri = {
      .uri = "/action",
      .method = HTTP_GET,
      .handler = cmd_handler, //cmd_handler  首页的函数 句柄
      .user_ctx = NULL};
  httpd_uri_t stream_uri = {
      .uri = "/stream",
      .method = HTTP_GET,
      .handler = stream_handler,
      .user_ctx = NULL};
  if (httpd_start(&camera_httpd, &config) == ESP_OK)
  {
    httpd_register_uri_handler(camera_httpd, &index_uri);
    httpd_register_uri_handler(camera_httpd, &cmd_uri);
  }
  config.server_port += 1;
  config.ctrl_port += 1;
  if (httpd_start(&stream_httpd, &config) == ESP_OK)
  {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
  }
}



void setup()
{
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // disable brownout detector
  int LED=4;
  pinMode(MOTOR_1_PIN_1, OUTPUT);
  pinMode(MOTOR_1_PIN_2, OUTPUT);
  pinMode(MOTOR_2_PIN_1, OUTPUT);
  pinMode(MOTOR_2_PIN_2, OUTPUT);

  pinMode(LED, OUTPUT);

  
  Serial.begin(115200);
  Serial.setDebugOutput(false);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 30000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound())
  {
    config.frame_size = FRAMESIZE_HVGA;
    config.jpeg_quality = 16;
    config.fb_count = 1;
  }
  else
  {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK)
  {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  // Wi-Fi connection
  WiFi.mode(WIFI_AP_STA); // 设置模式为AP+STA
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");


  Serial.println(WiFi.localIP());
  
  IPAddress localIP = WiFi.localIP();
  String ip = localIP.toString();

  WiFi.softAP(ip.c_str(), password);


  digitalWrite(LED, HIGH);  delay(50);
  digitalWrite(LED, LOW);   delay(50);
  digitalWrite(LED, HIGH);  delay(50);
  digitalWrite(LED, LOW);   delay(50);

  // Start streaming web server
  startCameraServer();
}

void loop()
{
}