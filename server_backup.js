const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

// 连接到 SQLite 数据库
const db = new sqlite3.Database('attendance.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the attendance database.');
    
    // 创建考勤表
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rating INTEGER
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Attendance table created or already exists.');
    });
});

// 存储点名数据的 API
app.post('/attendance', (req, res) => {
    const { name, rating } = req.body;
    
    db.run('INSERT INTO attendance (name, rating) VALUES (?, ?)', [name, rating], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// 获取点名数据的 API
app.get('/attendance', (req, res) => {
    db.all('SELECT * FROM attendance', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 关闭数据库连接
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})