const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;
// 初始化SQLite数据库
const db = new sqlite3.Database(path.join(__dirname, 'diary.db'), (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('连接到SQLite数据库');
    // 创建点名记录表（姓名、评分、时间戳）
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 读取点名历史数据
const readAttendanceData = async () => {
  return new Promise((resolve) => {
    db.all('SELECT * FROM attendance ORDER BY timestamp DESC', (err, rows) => {
      if (err) {
        console.error('读取数据出错:', err);
        resolve({ history: [], count: 0 });
      } else {
        resolve({ history: rows, count: rows.length });
      }
    });
  });
};

// 写入点名历史数据
const writeAttendanceData = async (record) => {
  return new Promise((resolve) => {
    db.run('INSERT INTO attendance (name, rating) VALUES (?, ?)', [record.name, record.rating], function(err) {
      if (err) {
        console.error('写入数据出错:', err);
        resolve(false);
      } else {
        // 返回新插入的记录
        db.get('SELECT * FROM attendance WHERE id = ?', [this.lastID], (err, row) => {
          resolve(row || null);
        });
      }
    });
  });
};

// 获取点名历史
app.get('/api/history', async (req, res) => {
    const data = await readAttendanceData();
    res.json(data);
});

// 添加点名记录
app.post('/api/history', async (req, res) => {
    const { record } = req.body;
    const newRecord = await writeAttendanceData(record);
    if (newRecord) {
      const data = await readAttendanceData();
      res.json(data);
    } else {
      res.status(500).json({ error: '记录保存失败' });
    }
});

// 导入名单
app.post('/api/import', async (req, res) => {
    const { names } = req.body;
    // 这里可以添加处理名单的逻辑，比如存储到文件
    res.json({ message: '名单导入成功', names });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});