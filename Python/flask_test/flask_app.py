from flask import Flask, request, jsonify
import webview

app = Flask(__name__)

@app.route('/api/message', methods=['POST'])
def receive_message():
    data = request.json  # 获取 JSON 数据
    message = data.get('message', '')  # 从数据中提取消息
    print(f"Received message: {message}")  # 输出信息到控制台
    return jsonify({"status": "success", "message": message})  # 返回响应

@app.route('/api/greet', methods=['GET'])
def greet():
    name = request.args.get('name', 'World')  # 从查询参数中获取'name'
    return jsonify({"greeting": f"Hello, {name}!"})

def run_server():
    app.run(host='127.0.0.1', port=5000)

def open_webview():
    webview.create_window('Local WebApp', 'index.html')
    webview.start()

if __name__ == '__main__':
    import threading
    threading.Thread(target=run_server).start()
    open_webview()
