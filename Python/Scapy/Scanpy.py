import netifaces

def get_network_info():
    # 获取所有网络接口
    interfaces = netifaces.interfaces()
    network_info = {}

    for interface in interfaces:
        # 获取每个接口的地址信息
        addresses = netifaces.ifaddresses(interface)

        # 检查是否有 ipv4 地址
        if netifaces.AF_INET in addresses:
            ipv4_info = addresses[netifaces.AF_INET][0]
            ip_address = ipv4_info['addr']
            netmask = ipv4_info['netmask']

            # 计算网络地址（可以通过按位与操作实现）
            network_address = ip_address.rsplit('.', 1)[0] + '.0'  # 初步获取网络头
            network_info[interface] = {
                'ip_address': ip_address,
                'netmask': netmask,
                'network_address': network_address
            }

    return network_info

if __name__ == "__main__":
    network_info = get_network_info()
    
    for interface, info in network_info.items():
        print(f"接口: {interface}")
        print(f"  IP 地址: {info['ip_address']}")
        print(f"  子网掩码: {info['netmask']}")
        print(f"  网络地址: {info['network_address']}/24 (假设子网掩码为255.255.255.0)")
