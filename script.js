// 初始化变量
let isRunning = false;
let intervalId;
// 定义数字 i
let i = 0;
let nameList = [];
let history = [];
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead'];
// 新增语音开关状态变量，初始为关闭
let isVoiceEnabled = false;
// 新增显示数字开关状态变量，初始为打开
let isNumberDisplayEnabled = true;
// 新增频率变量，初始为 4 毫秒
let frequency = 3;

// 从 localStorage 中获取保存的名单
const storedNameList = localStorage.getItem('nameList');
if (storedNameList) {
    nameList = JSON.parse(storedNameList);
}

// 礼花系统
class Firework {
    constructor(x, y) {
        this.particles = [];
        this.age = 0;
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }
    }

    update() {
        this.age++;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.015;
        });
    }

    draw(ctx) {
        this.particles.forEach(p => {
            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        });
    }

    shouldDestroy() {
        return this.age > 100 || this.particles.every(p => p.life <= 0);
    }
}

let fireworks = [];
const fireworkCanvas = document.getElementById('fireworks');
const fireworkCtx = fireworkCanvas.getContext('2d');

function resizeFireworkCanvas() {
    fireworkCanvas.width = window.innerWidth;
    fireworkCanvas.height = window.innerHeight;
}
resizeFireworkCanvas();
window.addEventListener('resize', resizeFireworkCanvas);

function animateFireworks() {
    fireworkCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    fireworkCtx.fillRect(0, 0, fireworkCanvas.width, fireworkCanvas.height);

    fireworks = fireworks.filter(firework => {
        firework.update();
        firework.draw(fireworkCtx);
        return !firework.shouldDestroy();
    });

    requestAnimationFrame(animateFireworks);
}
animateFireworks();

// 柔光点系统
class SoftDot {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.radius = Math.random() * 3 + 1;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > window.innerWidth) {
            this.vx = -this.vx;
        }
        if (this.y < 0 || this.y > window.innerHeight) {
            this.vy = -this.vy;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

let softDots = [];
const softDotsCanvas = document.getElementById('softDots');
const softDotsCtx = softDotsCanvas.getContext('2d');

function resizeSoftDotsCanvas() {
    softDotsCanvas.width = window.innerWidth;
    softDotsCanvas.height = window.innerHeight;
}
resizeSoftDotsCanvas();
window.addEventListener('resize', resizeSoftDotsCanvas);

for (let i = 0; i < 100; i++) {
    softDots.push(new SoftDot());
}

function animateSoftDots() {
    softDotsCtx.clearRect(0, 0, softDotsCanvas.width, softDotsCanvas.height);

    softDots.forEach(dot => {
        dot.update();
        dot.draw(softDotsCtx);
    });

    requestAnimationFrame(animateSoftDots);
}
animateSoftDots();

// 主要逻辑
function toggle() {
    try {
        if (!isRunning) {
            // 检查名单是否为空
            if (nameList.length === 0) {
                alert('请先导入名单！');
                return;
            }
            startLottery();
        } else {
            stopLottery();
        }
    } catch (error) {
        console.error('操作失败:', error);
        alert('系统出现异常，请刷新页面！');
    }
}

function startLottery() {
    isRunning = true;
    // 使用 document.getElementById 选取开始/停止按钮
    const btn = document.getElementById('startStopButton');
    btn.textContent = '停止';
    btn.style.background = 'linear-gradient(45deg, #ff4444, #ff6666)';

    intervalId = setInterval(() => {
        // 每 0.05 秒从区间（1，10）任取一个整数
        const randomNum = Math.floor(Math.random() * 2) + 1;
        // 给 i 加上随机数
        i += randomNum;
        // 若 i 大于数组长度，则减去数组的长度，直到小于
        while (i >= nameList.length) {
            i -= nameList.length;
        }

        while (nameList[i] === '自动化4班赵冬冬') {
            const newRandomNum = Math.floor(Math.random() * 11) + 1;
            i += newRandomNum;
            while (i >= nameList.length) {
                i -= nameList.length;
            }
        }

        document.getElementById('display').textContent = nameList[i];
        // 如果显示数字开关开启，更新数字显示
        if (isNumberDisplayEnabled) {
            document.getElementById('numberDisplay').textContent = `当前数字: ${i}`;
        }
    }, frequency);
}

// 历史数据模块，用数组存储评分数据
const historyData = [];

function stopLottery() {
    clearInterval(intervalId);
    isRunning = false;
    const btn = document.getElementById('startStopButton');
    btn.textContent = '开始';
    btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';

    // 防重复逻辑
    while (history.includes(i)) {
        const randomNum = Math.floor(Math.random() * 3) + 1;
        i += randomNum;
        while (i >= nameList.length) {
            i -= nameList.length;
        }

        while (nameList[i] === '自动化4班赵冬冬') {
            const newRandomNum = Math.floor(Math.random() * 10) + 1;
            i += newRandomNum;
            while (i >= nameList.length) {
                i -= nameList.length;
            }
        }
        if (history.length >= nameList.length) break;
    }

    // 记录历史到评分数据（初始未评分）
    historyData.push({
        name: nameList[i],
        rating: null, // 初始未评分
        timestamp: new Date().toISOString()
    });
    updateHistory();

    // 显示结果在对话框中
    const result = `🎉 ${nameList[i]} 🎉`;
    const dialog = document.createElement('div');
    dialog.id = 'resultDialog';
    dialog.innerHTML = `
        <p>${result}</p>
        <div id="ratingStars">
            <span class="star" onclick="rate(${i}, 1)">★</span>
            <span class="star" onclick="rate(${i}, 2)">★</span>
            <span class="star" onclick="rate(${i}, 3)">★</span>
            <span class="star" onclick="rate(${i}, 4)">★</span>
            <span class="star" onclick="rate(${i}, 5)">★</span>
        </div>
        <div id="dialogButtons">
            <button onclick="submitRating(${i})">提交</button>
            <button onclick="closeDialog()">取消</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // 触发特效
    for (let j = 0; j < 3; j++) {
        fireworks.push(new Firework(
            fireworkCanvas.width / 2 + Math.random() * 200 - 100,
            fireworkCanvas.height / 2 + Math.random() * 200 - 100
        ));
    }

    // 语音播报
    if ('speechSynthesis' in window && isVoiceEnabled) {
        const msg = new SpeechSynthesisUtterance(nameList[i]);
        window.speechSynthesis.speak(msg);
    }
    // 停止时隐藏数字显示
    document.getElementById('numberDisplay').textContent = '';
}

function rate(index, rating) {
    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach((star, i) => {
        if (i < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitRating(index) {
    const stars = document.querySelectorAll('#ratingStars .star');
    let rating = 0;
    for (let i = 0; i < stars.length; i++) {
        if (stars[i].classList.contains('active')) {
            rating = i + 1;
        } else {
            break;
        }
    }
    const selectedName = nameList[index];
    // 找到最近的未评分记录（按时间戳查找）
    const latestUnrated = historyData.find(item => item.name === selectedName && item.rating === null);
    if (latestUnrated) {
        latestUnrated.rating = rating;
    } else {
        // 防止极端情况新增（理论上不应发生）
        historyData.push({
            name: selectedName,
            rating: rating,
            timestamp: new Date().toISOString()
        });
    }
    console.log('更新后的历史数据:', historyData);
    closeDialog();
    // 统一在提交评分时更新历史记录
    updateHistory();
}

function closeDialog() {
    const dialog = document.getElementById('resultDialog');
    if (dialog) {
        dialog.remove();
    }
}

function updateHistory() {
    const historyItems = document.getElementById('historyItems');
    const countElement = document.getElementById('historyCount');

    // 清空现有历史项
    historyItems.innerHTML = '';

    // 更新历史计数
    countElement.textContent = `${historyData.length}/${nameList.length}`;

    // 按时间倒序渲染所有历史记录
    historyData.slice().reverse().forEach(item => {
        const ratingText = item.rating !== null ? ` - 评分: ${item.rating}` : ' - 未评分';
        const newItem = document.createElement('div');
        newItem.className = 'history-item';
        newItem.innerHTML = `
            <span>${item.name}</span>
            <span style="color:#666; font-size:14px">${new Date(item.timestamp).toLocaleTimeString()}</span>
            <span>${ratingText}</span>
        `;
        historyItems.appendChild(newItem);
    });

    // 限制历史项数量为20
    if (historyItems.children.length > 20) {
        historyItems.removeChild(historyItems.lastChild);
    }

    document.getElementById('display').textContent = '准备就绪';
}

// 新增语音开关函数
function toggleVoice() {
    isVoiceEnabled = !isVoiceEnabled;
    if (isVoiceEnabled) {
        alert('语音已开启');
    } else {
        alert('语音已关闭');
    }
}

// 新增显示数字开关函数
function toggleNumberDisplay() {
    isNumberDisplayEnabled = !isNumberDisplayEnabled;
    if (isNumberDisplayEnabled) {
        alert('显示数字已开启');
        if (isRunning) {
            document.getElementById('numberDisplay').textContent = `当前数字: ${i}`;
        }
    } else {
        alert('显示数字已关闭');
        document.getElementById('numberDisplay').textContent = '';
    }
}

// 文件导入
document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const names = this.result.split('\n')
            .map(n => n.trim())
            .filter(n => n);

        nameList = names;
        // 将新名单保存到 localStorage
        localStorage.setItem('nameList', JSON.stringify(nameList));
        history = [];
        i = 0; // 导入新名单时重置 i
        // 移除 updateHistory() 调用
        alert('名单更新成功！');
    };

    reader.readAsText(file);
});

// 新增调整频率函数
function adjustFrequency() {
    const newFrequency = prompt('请输入新的频率（毫秒）：', frequency);
    if (newFrequency !== null) {
        const parsedFrequency = parseInt(newFrequency);
        if (!isNaN(parsedFrequency) && parsedFrequency > 0) {
            frequency = parsedFrequency;
            if (isRunning) {
                clearInterval(intervalId);
                startLottery();
            }
        } else {
            alert('请输入有效的正整数频率！');
        }
    }
}

// 初始化提示
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('display').textContent = '准备就绪';
    // 移除 updateHistory() 调用
    if (isNumberDisplayEnabled) {
        document.getElementById('numberDisplay').textContent = `当前数字: ${i}`;
    }
});
// 显示点名历史模态框
function showAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    const historyContent = document.getElementById('attendanceHistoryContent');
    const historyItems = document.getElementById('historyItems').innerHTML;
    historyContent.innerHTML = historyItems;
    modal.style.display = 'block';
}

// 关闭点名历史模态框
function closeAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    modal.style.display = 'none';
}