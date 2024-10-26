import asyncio
import websockets
import datetime
import pywifi
import time

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

if __name__ == '__main__':
    asyncio.run(start_server())  # 使用 asyncio.run() 启动事件循环
