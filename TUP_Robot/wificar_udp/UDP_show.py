import socket
import cv2
import numpy as np

UDP_IP = "0.0.0.0"  # 监听所有接口
UDP_PORT = 12345     # 根据 ESP32 设置的端口号

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

while True:
    # 接收数据并进行处理
    data, addr = sock.recvfrom(65536)  # 接受最多65536字节
    nparr = np.frombuffer(data, np.uint8)  # 将数据转换为 numpy 数组
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # 解码 JPEG 数据

    if frame is not None:
        cv2.imshow('ESP32-CAM', frame)  # 显示画面
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cv2.destroyAllWindows()
