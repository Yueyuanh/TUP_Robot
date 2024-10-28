import webview
import os
import sys
import tkinter as tk
from tkinter import messagebox
import threading
import pywifi
import time
import asyncio
import websockets
import datetime

# 初始化提示
def ask_fullscreen():
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口
    result = messagebox.askyesno("全屏模式", "你希望以全屏模式打开吗？")
    root.destroy()  # 销毁主窗口
    return result

async def scan_wifi():
    wifi = pywifi.PyWiFi()  # 创建 PyWiFi 对象
    iface = wifi.interfaces()[0]  # 选择第一个 Wi-Fi 接口
    iface.scan()  # 开始扫描
    await asyncio.sleep(2)  # 等待扫描完成
    scan_results = iface.scan_results()  # 获取扫描结果

    # 获取以 '192' 开头的 SSID 列表
    ssids = [network.ssid for network in scan_results if network.ssid.startswith('192')]
    return ssids  # 返回扫描到的 SSID 列表

# 创建 WebSocket 服务器
async def main_logic(websocket, path):
    async for message in websocket:
        if message == "scan":  # 只在收到 "scan" 消息时进行扫描
            ssids = await scan_wifi()  # 执行扫描
            dt_ms = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
            response = ssids if ssids else '404'
            await websocket.send(response)  # 发送扫描结果到客户端

# 启动 WebSocket 服务器
async def start_server():
    server = websockets.serve(main_logic, 'localhost', 5001)
    async with server:
        await asyncio.Future()  # 运行直到手动停止

def run_websocket_server():
    asyncio.run(start_server())  # 在新的事件循环中运行 WebSocket 服务器

def main():

    current_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    html_file_path = os.path.join(current_dir, './Web/index.html')  # 确保路径正确

    # 询问用户是否全屏
    fullscreen = ask_fullscreen()
    if fullscreen:
        # 创建窗口
        webview.create_window('HTML Viewer', html_file_path, fullscreen=fullscreen)
    else:
        webview.create_window('HTML Viewer', html_file_path, width=1920, height=1080)




    # 启动 WebSocket 服务器的线程
    websocket_thread = threading.Thread(target=run_websocket_server)
    websocket_thread.daemon = True  # 设置为守护线程，主程序退出时线程也会退出
    websocket_thread.start()

    # 启动窗口并全屏显示
    webview.start()

if __name__ == '__main__':
    main()
