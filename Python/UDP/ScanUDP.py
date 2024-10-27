import socket

def udp_server(host='0.0.0.0', port=12345):
    # 创建 UDP 套接字
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    # 绑定套接字到指定的地址和端口
    udp_socket.bind((host, port))
    
    print(f"UDP 服务器正在运行，监听 {host}:{port}")
    
    while True:
        # 等待接收数据
        data, addr = udp_socket.recvfrom(1024)  # 缓冲区大小为 1024 字节
        print(f"接收到来自 {addr} 的数据: {data.decode()}")  # 解码并打印

if __name__ == "__main__":
    udp_server()
