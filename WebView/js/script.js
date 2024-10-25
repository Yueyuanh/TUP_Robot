// 处理欢迎界面的显示逻辑

// document.getElementById("welcome-screen").style.display = "none"; // 隐藏欢迎界面
// document.getElementById("main-screen").style.display = "block"; // 显示主界面

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

    // if(document.getElementById("main-screen").style.display!='none'){
    //     ready_bgm.play(); // 只有在欢迎界面时才播放音乐
    // }

};



// 游戏相关逻辑
let myHealth = 250; // 初始化自己的血量

//无信号
const noStreamText = document.getElementById("no-stream");
//血条
const healthFill = document.getElementById("self-health-fill");
const healthText = document.getElementById("health-text");
//对话框
const dialog = document.getElementById("dialog");
//设置对话框
const settingsDialog = document.getElementById('settings-dialog');
const overlay = document.getElementById('overlay');
const musicToggle = document.getElementById('music-toggle');
//倒计时
let countdownElement = document.getElementById("countdown");

let countdown; // 倒计时变量
let totalTime; // 保存总时间（以秒为单位）
const timeDisplay = document.querySelector(".time"); // 获取时间显示的元素
let isGameStarted = false; // 标记比赛是否开始


// 设置背景图片源
document.getElementById("background-image").src = "http://192.168.4.1:81/stream";

// 监听视频加载错误

const backgroundImage = document.getElementById("background-image");
backgroundImage.onerror = function() {
    backgroundImage.style.display = "none"; // 隐藏视频
    noStreamText.style.display = "block"; // 显示"No Stream"
    document.body.style.backgroundColor = "#888"; // 设置背景为灰色
};


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


// 监听键盘事件
document.addEventListener("keydown", function(event) {
    if (event.key === "p" || event.key === "P") {
        if (dialog.style.display === "block") {
            dialog.style.display = "none"; // 关闭对话框
        } else {
            dialog.style.display = "block"; // 显示对话框
            settingsDialog.style.display = "none"; // 关闭对话框
        }
    }
    else if (event.key === "o" || event.key === "O") {
        if (settingsDialog.style.display === "block") {
            settingsDialog.style.display = "none"; // 关闭对话框

        } else {
            settingsDialog.style.display = "block"; // 显示对话框
            dialog.style.display = "none"; // 关闭对话框

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
document.getElementById("toggle-button").onclick = function() {
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
                document.getElementById("toggle-button").textContent = "开始比赛"; // 恢复按钮文本
                isGameStarted = false; // 更新比赛状态为未开始
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

  // 监听背景音乐开关
  musicToggle.addEventListener('change', () => {
    if (musicToggle.checked) {
        if (isGameStarted) {
            start_bgm.play(); // 开启音乐
        }
        else {
            ready_bgm.play(); // 开启音乐
        }
        // start_bgm.play(); // 开启音乐
    } else {
        if (isGameStarted) {
            start_bgm.pause(); // 
        }
        else {
            ready_bgm.pause(); // 
        } 
    }
});




// 键鼠监听
const tooltip     = document.getElementById('tooltip');
const tooltip_key = document.getElementById('tooltip-key');

// document.addEventListener('mousemove', (event) => {
//     tooltip.style.left = event.pageX + 'px';
//     tooltip.style.top = event.pageY + 'px';
// });

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

document.addEventListener('mousedown', (event) => {
    let button;
    switch (event.button) {
        case 0:
            button = '左键';

            currentRatio += 0.1; // 每次点击增加 0.1
            if (currentRatio > 1) { // 超过 1 后重置
                currentRatio = 0;
            }
            drawCircle(currentRatio); // 绘制当前比例的圆
            // 终端输出当前比例
            console.log(currentRatio);
            // tooltip.style.display = 'none'; // 放开鼠标时隐藏提示框
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


});

drawCircle(0); // 初始化

