import psutil
import socket

def get_all_network_adapters():
    # 获取所有网络接口地址
    network_info = psutil.net_if_addrs()
    
    for interface, addresses in network_info.items():
        print(f"适配器: {interface}")
        for address in addresses:
            if address.family == socket.AF_INET:  # 仅处理 IPv4 地址
                print(f"  IP 地址: {address.address}")
            elif address.family == socket.AF_INET6:  # 你可以选择处理 IPv6 地址
                print(f"  IPv6 地址: {address.address}")

if __name__ == "__main__":
    get_all_network_adapters()
