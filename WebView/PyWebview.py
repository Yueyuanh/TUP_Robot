import webview
import os
import sys
import tkinter as tk
from tkinter import messagebox

def ask_fullscreen():
    # 创建一个Tkinter窗口（可以是隐形的）
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口

    # 弹出对话框询问用户是否全屏
    result = messagebox.askyesno("全屏模式", "你希望以全屏模式打开吗？")

    root.destroy()  # 销毁主窗口
    return result

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

if __name__ == '__main__':
    main()
