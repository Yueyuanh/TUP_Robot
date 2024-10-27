import psutil
import socket

def check_ip_exists(target_ip):
    # 获取所有网络接口地址
    network_info = psutil.net_if_addrs()
    
    for interface, addresses in network_info.items():
        for address in addresses:
            if address.family == socket.AF_INET:  # 检查是否为 IPv4 地址
                if address.address == target_ip:
                    return True, interface
    
    return False, None

if __name__ == "__main__":
    ip_to_check = input("请输入要检查的IP地址: ")
    exists, interface = check_ip_exists(ip_to_check)

    if exists:
        print(f"IP 地址 {ip_to_check} 存在于网络适配器: {interface}")
    else:
        print(f"IP 地址 {ip_to_check} 不存在于本地网络适配器中。")
