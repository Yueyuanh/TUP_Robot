import asyncio
import websockets
import socket

UDP_IP = "0.0.0.0"  # 监听所有接口
UDP_PORT = 12345     # UDP 端口
WEBSOCKET_PORT = 6789  # WebSocket 端口

clients = set()

async def echo(websocket, path):
    clients.add(websocket)
    try:
        while True:
            message = await websocket.recv()
            # 不需处理消息，直接等待
    except websockets.exceptions.ConnectionClosed:
        clients.remove(websocket)

async def udp_listener():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"Listening for UDP packets on {UDP_IP}:{UDP_PORT}")

    while True:
        data, addr = sock.recvfrom(1024)  # 1024字节缓冲区
        message = data.decode('utf-8')  # 解码为字符串
        print(f"Received message from {addr}: {message}")
        # 通过 WebSocket 将收到的消息发送到所有连接的客户端
        if clients:  # 如果有客户端连接
            await asyncio.wait([client.send(message) for client in clients])

start_server = websockets.serve(echo, "localhost", WEBSOCKET_PORT)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_until_complete(udp_listener())
asyncio.get_event_loop().run_forever()
