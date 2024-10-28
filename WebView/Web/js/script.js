
// <--------------------------处理欢迎界面的显示逻辑--------------------------->

document.getElementById("welcome-screen").style.display = "none"; // 隐藏欢迎界面
document.getElementById("main-screen").style.display = "block"; // 显示主界面

const welcome_bgm = document.getElementById("welcome-audio");
const ready_bgm = document.getElementById("ready-audio");
const start_bgm = document.getElementById("start-audio");


// 点击
document.addEventListener('click', () => {
    const welcomeScreen = document.getElementById("welcome-screen");
    if (welcomeScreen.style.display !== "none") { // 检查欢迎界面是否可见
        welcome_bgm.play(); // 只有在欢迎界面时才播放音乐
    }});


document.getElementById("start-game").onclick = function() {
    // 检查音频是否正在播放
    if (!welcome_bgm.paused) {
        welcome_bgm.pause(); // 如果正在播放，则暂停
    }
    document.getElementById("welcome-screen").style.display = "none"; // 隐藏欢迎界面
    document.getElementById("main-screen").style.display = "block"; // 显示主界面
    ready_bgm.play(); // 只有在欢迎界面时才播放音乐

};
// <--------------------------处理欢迎界面的显示逻辑--------------------------->

// 监听视频加载错误
const backgroundImage = document.getElementById("background-image");
backgroundImage.onerror = function() {
    backgroundImage.style.display = "none"; // 隐藏视频
    noStreamText.style.display = "block"; // 显示"No Stream"
    document.body.style.backgroundColor = "#888"; // 设置背景为灰色
};

// <--------------------------WebSocket 连接--------------------------->

const ws = new WebSocket('ws://localhost:5001'); // 连接到 WebSocket 服务器


//收到信息
ws.onmessage = function(event) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML += `<p>${event.data}</p>`; // 显示接收到的消息

    ssids = event.data; // 解析 SSIDs 列表
    
     // 清空下拉框选项
     dropdown.innerHTML = '';  // 先清空下拉框内容

     // 判断 ssid 是否为空
     if (ssids==='404') {
         const option = document.createElement('option');
         option.value = '无信号';
         option.textContent = '无信号';  // 如果没有信号则添加此选项
         dropdown.appendChild(option);
     } else {
         // 添加新的选项
             console.log(ssids);
             const option = document.createElement('option');
             option.value = ssids;
             option.textContent = ssids;
             dropdown.appendChild(option);
    
     }
};

//发送刷新扫描请求
document.getElementById('update-button').onclick = function() {
    ws.send('scan');  // 发送扫描请求
    backgroundImage.style.display = "none"; // 隐藏视频
    noStreamText.style.display = "block"; // 显示"No Stream"
    document.body.style.backgroundColor = "#888"; // 设置背景为灰色
};

//登录刷新画面
document.getElementById('login-button').onclick = function() {
    const selectedSSID = dropdown.value; // 获取选中的 SSID};

    if (selectedSSID === '404') {
        backgroundImage.src = ""; // 清空背景图片源
        backgroundImage.style.display = "none"; // 隐藏图片
    } else {
        backgroundImage.src = ""; // 清空背景图片源
        document.getElementById("background-image").src = `http://${selectedSSID}:81/stream`; // 生成新 URL
        backgroundImage.style.display = "block"; // 视频
        noStreamText.style.display = "none"; // 关闭"No Stream"     
    }
 
}

//报错
ws.onerror = function(error) {
    console.error('WebSocket错误:', error); // 打印错误信息
};

// <--------------------------WebSocket 连接--------------------------->




// 游戏相关逻辑
let myHealth = 250; // 初始化自己的血量

//无信号
const noStreamText = document.getElementById("no-stream");
//血条
const healthFill = document.getElementById("self-health-fill");
const healthText = document.getElementById("health-text");
//对话框
const dialog = document.getElementById("dialog");
//IP选择框
const dropdown = document.getElementById("wifiDropdown");

//倒计时
let countdownElement = document.getElementById("countdown");

let countdown; // 倒计时变量
let totalTime; // 保存总时间（以秒为单位）
const timeDisplay = document.querySelector(".time"); // 获取时间显示的元素
let isGameStarted = false; // 标记比赛是否开始



// <--------------------------UI 更新--------------------------->


// 血量条更新函数
function updateHealthBar(who, healthValue) {
    let fillElement;
    let healthTextElement;

    // 根据输入的 'who' 参数选择相应的元素
    if (who === 'red') {
        fillElement = document.getElementById("health-fill-red");
        healthTextElement = document.getElementById("health-text-red");
    } else if (who === 'blue') {
        fillElement = document.getElementById("health-fill-blue");
        healthTextElement = document.getElementById("health-text-blue");
    } else if (who === 'self') {
        fillElement = document.getElementById("self-health-fill");
        healthTextElement = document.getElementById("health-text-self");
    } else {
        alert("未知的血条类型！");
        return; // 退出函数
    }

    // 更新血条的宽度和文本
    if (healthValue >= 0 && healthValue <= 250) {
        if(who=='red'){
            fillElement.style.width = 250-healthValue + '%'; // 更新宽度
            healthTextElement.textContent = `${healthValue} / 250`; // 更新文本     
        }
        else if(who=='blue'){
            fillElement.style.width = healthValue/250*100 + '%'; // 更新宽度
            healthTextElement.textContent = `${healthValue} / 250`; // 更新文本     
        }
        else if(who=='self'){
            fillElement.style.width = healthValue/250*100 + '%'; // 更新宽度
            healthTextElement.textContent = `${healthValue} / 250`; // 更新文本     
        }

    }
}
// <--------------------------UI 更新--------------------------->


// <--------------------------对话框--------------------------->


// 监听键盘事件
document.addEventListener("keydown", function(event) {
    if (event.key === "p" || event.key === "P") {
        if (dialog.style.display === "block") {
            dialog.style.display = "none"; // 关闭对话框
        } else {
            dialog.style.display = "block"; // 显示对话框
        }
    }

});

// 选择红方
document.getElementById("red-button").onclick = function() {
    healthFill.style.backgroundColor = "red"; // 设置颜色为红
    healthText.textContent = `健康 ${myHealth} / 250`;
    dialog.style.display = "none"; // 关闭对话框
};

// 选择蓝方
document.getElementById("blue-button").onclick = function() {
    healthFill.style.backgroundColor = "#1a81e2"; // 设置颜色为淡蓝色
    healthText.textContent = `健康 ${myHealth} / 250`;
    dialog.style.display = "none"; // 关闭对话框
};

// 切换比赛状态
document.getElementById("start-button").onclick = function() {
    if (!isGameStarted) {
        totalTime = 7 * 60; // 每次开始时重置为7分钟

        dialog.style.display = "none"; // 关闭对话框
        closeCentercanvas(true); // 关闭中心画布
        countdownElement.style.display = "block"; // 显示倒计时


        startCountdown5(5); // 从 5 开始倒计时
        startCountdown(); // 启动倒计时

        this.textContent = "结束比赛"; // 更改按钮文本
        isGameStarted = true; // 更新比赛状态为已开始

        updateHealthBar('red', 250);
        updateHealthBar('blue', 250);
        updateHealthBar('self', 250);

        ready_bgm.pause(); // 暂停准备音乐
        ready_bgm.currentTime = 0; // 重置开始音乐播放位置
        start_bgm.play(); // 播放开始音乐

    } else {
        clearInterval(countdown); // 停止倒计时
        alert("比赛已经结束！"); // 可选择添加比赛结束的逻辑
        this.textContent = "开始比赛"; // 恢复按钮文本
        dialog.style.display = "none"; // 关闭对话框
        isGameStarted = false; // 更新比赛状态为未开始

        ready_bgm.play(); // 播放准备音乐
        start_bgm.pause(); // 暂停开始音乐
        start_bgm.currentTime = 0; // 重置开始音乐播放位置
    }
};

function startCountdown() {
    // 先清除可能存在的旧倒计时
    clearInterval(countdown);

    // 设置 5 秒的延时，再执行启动倒计时的逻辑
    setTimeout(function() {
        countdown = setInterval(function() {
            if (totalTime <= 0) {
                clearInterval(countdown); // 停止倒计时
                alert("比赛结束！"); // 比赛结束时的提示
                document.getElementById("start-button").textContent = "开始比赛"; // 恢复按钮文本
                isGameStarted = false; // 更新比赛状态为未开始
                ready_bgm.play(); // 播放准备音乐
                start_bgm.pause(); // 暂停开始音乐
                start_bgm.currentTime = 0; // 重置开始音乐播放位置
                return;
            }

            let minutes = Math.floor(totalTime / 60);
            let seconds = totalTime % 60;
            timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`; // 格式化时间显示
            totalTime--; // 每秒减少1
        }, 1000); // 每1000ms（1秒）调用一次
    }, 5000); // 延迟5000毫秒（5秒）后开始倒计时
}


function startCountdown5(seconds) {
    let timeLeft = seconds;
    countdownElement.textContent = timeLeft; // 更新倒计时时间
    const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 1) {
            countdownElement.textContent = timeLeft; // 更新倒计时显示
        } else {
            clearInterval(countdownInterval); // 清除定时器
            countdownElement.textContent = "GO!"; // 倒计时结束显示 "GO!"
            countdownElement.style.display = "none"; // 关闭倒计时
            //打开中心画布
            closeCentercanvas(false);
        }
    }, 1000); // 每秒更新一次
}


// 获取音量滑动条
    const volumeSlider = document.getElementById('volume');
    const volumeText = document.getElementById('volume-text');
    // 设置初始音量
    start_bgm.volume = 0.8; // 音量范围是 0.0 到 1.0
    ready_bgm.volume = 0.8; // 同样设置准备音乐的音量

    // 监听音量滑动条的变化
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value/100; // 获取滑动条的当前值
        //volume始终取整


        start_bgm.volume = volume; // 设置背景音乐的音量
        ready_bgm.volume = volume; // 设置准备音乐的音量

        volumeText.textContent = `背景音量设置 ${Math.round(volume * 100)}`; // 更新音量显示

    });

// <--------------------------对话框--------------------------->



// <--------------------------热量环动画--------------------------->

// 热量环动画
let currentRatio = 0; // 当前比例，初始为 0.1
const canvas = document.getElementById('circle');
const crosshair = document.getElementById('crosshair');

if (!canvas.getContext('2d')) {
    console.log('浏览器不支持Canvas');
}
const ctx = canvas.getContext('2d');

function drawCircle(value) {

    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
    ctx.strokeStyle = '#fb2828';  // 边界颜色
    ctx.lineWidth = 10;  // 边界宽度
    ctx.beginPath();  // 路径开始
    if(value==0){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
    }
    else{
        ctx.arc(100, 100, 70,0, (Math.PI * 2)*(1-value), true);  // 绘制路径
        ctx.stroke();
    }
        
}

//外环
const canvas_outer = document.getElementById('circle-outer');
if (!canvas_outer.getContext('2d')) {
    console.log('浏览器不支持Canvas');
}
const ctx_outer = canvas_outer.getContext('2d');
ctx_outer.strokeStyle = 'rgba(255, 255, 255, 0.5)';  // 边界颜色
ctx_outer.lineWidth = 10;  // 边界宽度
ctx_outer.beginPath();  // 路径开始
ctx_outer.arc(100, 100, 70,0, (Math.PI * 2), true);  // 绘制路径
ctx_outer.stroke();

function closeCentercanvas(bool) {
    if(bool == true){
        canvas.style.display = "none"; 
        canvas_outer.style.display = "none";  
        crosshair.style.display = 'none';       
    }
    else{
        canvas.style.display = "block"; 
        canvas_outer.style.display = "block"; 
        crosshair.style.display = 'block';       
  
    }   

}


drawCircle(0); // 初始化
// <--------------------------热量环动画--------------------------->



// <--------------------------键鼠监听--------------------------->

// 键鼠监听
const tooltip     = document.getElementById('tooltip');
const tooltip_key = document.getElementById('tooltip-key');

document.addEventListener('keydown', (event) => {
    // 显示按键信息
    tooltip_key.textContent = `键盘按键: ${event.key}`;
    tooltip_key.style.display = 'block';

});

document.addEventListener('keyup', () => {
    tooltip_key.textContent = `键盘按键: 无`;
    tooltip_key.style.display = 'block';
    // tooltip_key.style.display = 'none'; // 放开按键时隐藏提示框
});


document.addEventListener('mousedown', (event) => {
    let button;
    switch (event.button) {
        case 0:
            button = '左键';

            //当对话框不存在的时候才能点击
            if(dialog.style.display === "none"){

                currentRatio += 0.1; // 每次点击增加 0.1
                if (currentRatio > 1) { // 超过 1 后重置
                    currentRatio = 0;
                }
                drawCircle(currentRatio); // 绘制当前比例的圆

                //开枪决策
                toggleLED('on');
                //输出日志
                console.log('on');

  
            }

            break;
        case 1:
            button = '中键';
            break;
        case 2:
            button = '右键';
            break;
        default:
            button = '其他';
            break;
    }
    tooltip.textContent = `鼠标按键: ${button}`;
    tooltip.style.display = 'block';

});

// 鼠标点击事件
document.addEventListener('mouseup', () => {
    tooltip.textContent = `鼠标按键: 无`;
    tooltip.style.display = 'block';
    toggleLED('off');

});



function handleKeyDown(event) {
    switch(event.key) {
      case 'w':
        controlCar('forward');
        break;
      case 'a':
        controlCar('left');
        break;
      case 's':
        controlCar('backward');
        break;
      case 'd':
        controlCar('right');
        break;
      case 'l':
        toggleLED('on');
        break;

    }
  }
  
  function handleKeyUp(event) {

    console.log("stop");
    switch(event.key)
    {
      case 'l':
        toggleLED('off');
        break;
      case 'w':
      case 'a':
      case 's':
      case 'd':
        stop('stop');
        stop('stop');
        break;

    }
  }
  
  window.onload = function() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  };
// <--------------------------键鼠监听--------------------------->


function toggleLED(x) {
    const selectedSSID = dropdown.value; // 获取选中的 SSID};
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${selectedSSID}/action?led=` + x, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('成功:', xhr.responseText); // 成功响应处理
        } else {
            console.error('请求失败:', xhr.statusText); // 错误处理
        }
    };
    xhr.onerror = function() {
        console.error('请求发生错误');
    };
    xhr.send();
}

function stop(x) {
    //x='forward'
    //x='backward'
    //x='left'
    //x='right'
    console.log(x);
    const selectedSSID = dropdown.value; // 获取选中的 SSID};
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${selectedSSID}/action?go=` + x, true);
    xhr.send();
}
var lastSentTime = 0; // 上一次发送指令的时间
var sendInterval = 100; // 发送指令的间隔
function controlCar(x) {
    const selectedSSID = dropdown.value; // 获取选中的 SSID};
    var currenTime=Date.now();
    if (currenTime - lastSentTime > sendInterval) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", `http://${selectedSSID}/action?go=` + x, true);
      xhr.send();
      lastSentTime = currenTime; // 更新上次发送时间
    }
  }

const map = document.getElementById("map");
const map_img = document.getElementById("map-image");

document.addEventListener('keydown', function(event) {
    if (event.key === 'M' || event.key === 'm') {
            map.style.top = "50%";
            map.style.left = "50%";
            map_img.classList.add('large');
            map_img.classList.remove('small');        
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'M' || event.key === 'm') {

            map.style.top = "82%";
            map.style.left = "90%";
            map_img.classList.add('small');   
            map_img.classList.remove('large');
         }
});