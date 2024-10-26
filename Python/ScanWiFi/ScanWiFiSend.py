from flask import Flask, jsonify, render_template
import pywifi
import time

app = Flask(__name__)

def scan_wifi():
    wifi = pywifi.PyWiFi()  # 创建 PyWiFi 对象
    iface = wifi.interfaces()[0]  # 选择第一个 Wi-Fi 接口
    iface.scan()  # 开始扫描
    time.sleep(2)  # 等待扫描完成
    scan_results = iface.scan_results()  # 获取扫描结果

    # 返回以 '192' 开头的 SSID 列表
    ssids = [network.ssid for network in scan_results if network.ssid.startswith('192')]
    return ssids

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan_wifi', methods=['GET'])
def scan_wifi_route():
    ssids = scan_wifi()
    return jsonify(ssids)

if __name__ == '__main__':
    app.run(debug=True)
