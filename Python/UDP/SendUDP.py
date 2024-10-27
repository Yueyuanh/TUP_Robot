import socket

def udp_client(host='127.0.0.1', port=12345):
    # 创建 UDP 套接字
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    message = "Hello, UDP Server!"
    udp_socket.sendto(message.encode(), (host, port))
    print(f"已发送消息: {message}")

    udp_socket.close()

if __name__ == "__main__":
    udp_client()
