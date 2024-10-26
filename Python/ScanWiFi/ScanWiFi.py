import pywifi
import time

def scan_wifi():
    wifi = pywifi.PyWiFi()  # 创建 PyWiFi 对象
    iface = wifi.interfaces()[0]  # 选择第一个 Wi-Fi 接口
    iface.scan()  # 开始扫描
    time.sleep(2)  # 等待扫描完成
    scan_results = iface.scan_results()  # 获取扫描结果

    # 打印以 "192" 开头的 SSID
    print("以 '192' 开头的 Wi-Fi 网络：")
    for network in scan_results:
        ssid = network.ssid
        if ssid.startswith('192'):
            print(ssid)

if __name__ == "__main__":
    scan_wifi()
