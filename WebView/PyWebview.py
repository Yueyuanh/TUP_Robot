import webview
import os
import sys
import tkinter as tk
from tkinter import messagebox
from flask import Flask, jsonify, render_template
import pywifi
import time

# 创建Flask应用
app = Flask(__name__)

# 初始化提示
def ask_fullscreen():
    # 创建一个Tkinter窗口（可以是隐形的）
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口

    # 弹出对话框询问用户是否全屏
    result = messagebox.askyesno("全屏模式", "你希望以全屏模式打开吗？")

    root.destroy()  # 销毁主窗口
    return result

# 扫描 Wi-Fi
def scan_wifi():
    wifi = pywifi.PyWiFi()  # 创建 PyWiFi 对象
    iface = wifi.interfaces()[0]  # 选择第一个 Wi-Fi 接口
    iface.scan()  # 开始扫描
    time.sleep(2)  # 等待扫描完成
    scan_results = iface.scan_results()  # 获取扫描结果

    # 返回以 '192' 开头的 SSID 列表
    ssids = [network.ssid for network in scan_results if network.ssid.startswith('192')]
    return ssids

# 路由
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan_wifi', methods=['GET'])
def scan_wifi_route():
    ssids = scan_wifi()
    return jsonify(ssids)

def main():
    # 获取当前目录
    current_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    html_file_path = os.path.join(current_dir, 'index.html')  # 确保路径正确

    # 询问用户是否全屏
    fullscreen = ask_fullscreen()

    # 创建窗口
    webview.create_window('HTML Viewer', html_file_path, fullscreen=fullscreen)

    # 启动窗口并全屏显示
    webview.start()

    # 启动Flask应用
    # app.run(debug=True)


if __name__ == '__main__':
    main()
