// 处理欢迎界面的显示逻辑

document.getElementById("welcome-screen").style.display = "none"; // 隐藏欢迎界面
document.getElementById("main-screen").style.display = "block"; // 显示主界面

const welcome_bgm = document.getElementById("welcome-audio");
welcome_bgm.play(); // 播放欢迎音乐

document.getElementById("start-game").onclick = function() {
    welcome_bgm.pause(); // 播放欢迎音乐
    document.getElementById("welcome-screen").style.display = "none"; // 隐藏欢迎界面
    document.getElementById("main-screen").style.display = "block"; // 显示主界面
};




// 游戏相关逻辑
let myHealth = 20; // 初始化自己的血量
const healthFill = document.getElementById("self-health-fill");
const healthText = document.getElementById("health-text");
const dialog = document.getElementById("dialog");
const noStreamText = document.getElementById("no-stream");
let countdown; // 倒计时变量
let totalTime; // 保存总时间（以秒为单位）
const timeDisplay = document.querySelector(".time"); // 获取时间显示的元素
let isGameStarted = false; // 标记比赛是否开始

// 页面加载时检查 localStorage
window.onload = function() {
    const savedTeam = localStorage.getItem("selectedTeam"); // 从 localStorage 获取选择的队伍
    if (savedTeam) {
        if (savedTeam === "red") {
            healthFill.style.backgroundColor = "red"; // 设置颜色为红
            healthText.textContent = `健康 ${myHealth} / 250`;
        } else if (savedTeam === "blue") {
            healthFill.style.backgroundColor = "#1a81e2"; // 设置颜色为淡蓝色
            healthText.textContent = `健康 ${myHealth} / 250`;
        }
    }
};

// 设置背景图片源
document.getElementById("background-image").src = "http://192.168.4.1:81/stream";

// 监听视频加载错误

const backgroundImage = document.getElementById("background-image");
backgroundImage.onerror = function() {
    backgroundImage.style.display = "none"; // 隐藏视频
    noStreamText.style.display = "block"; // 显示"No Stream"
    document.body.style.backgroundColor = "#888"; // 设置背景为灰色
};

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
    localStorage.setItem("selectedTeam", "red"); // 保存选择的队伍
};

// 选择蓝方
document.getElementById("blue-button").onclick = function() {
    healthFill.style.backgroundColor = "#1a81e2"; // 设置颜色为淡蓝色
    healthText.textContent = `健康 ${myHealth} / 250`;
    dialog.style.display = "none"; // 关闭对话框
    localStorage.setItem("selectedTeam", "blue"); // 保存选择的队伍
};

// 切换比赛状态
document.getElementById("toggle-button").onclick = function() {
    if (!isGameStarted) {
        totalTime = 7 * 60; // 每次开始时重置为7分钟
        dialog.style.display = "none"; // 关闭对话框
        startCountdown(); // 启动倒计时
        this.textContent = "结束比赛"; // 更改按钮文本
        isGameStarted = true; // 更新比赛状态为已开始
    } else {
        clearInterval(countdown); // 停止倒计时
        alert("比赛已经结束！"); // 可选择添加比赛结束的逻辑
        this.textContent = "开始比赛"; // 恢复按钮文本
        isGameStarted = false; // 更新比赛状态为未开始
    }
};

function startCountdown() {
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
}


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

document.addEventListener('mousedown', (event) => {
    let button;
    switch (event.button) {
        case 0:
            button = '左键';
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

document.addEventListener('mouseup', () => {
    tooltip.textContent = `鼠标按键: 无`;
    tooltip.style.display = 'block';
    // tooltip.style.display = 'none'; // 放开鼠标时隐藏提示框
});
