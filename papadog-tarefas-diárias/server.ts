import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    avatar TEXT,
    points INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Bronze'
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER,
    status TEXT DEFAULT 'PENDING',
    priority TEXT DEFAULT 'MEDIUM',
    start_date TEXT,
    due_date TEXT,
    attachment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS task_assignments (
    task_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goal_assignments (
    goal_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (goal_id, user_id),
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    message TEXT,
    task_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    praise_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS praise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    user_id INTEGER,
    task_id INTEGER,
    message TEXT,
    points_awarded INTEGER DEFAULT 0,
    type TEXT, -- 'PRAISE' or 'ADJUSTMENT'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    type TEXT, -- 'COMPANY' or 'INDIVIDUAL'
    frequency TEXT DEFAULT 'MONTHLY', -- 'DAILY', 'WEEKLY', 'MONTHLY'
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED'
    start_date TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migration: Ensure goals table has frequency and status columns if it already existed
try {
  db.prepare("ALTER TABLE goals ADD COLUMN frequency TEXT DEFAULT 'MONTHLY'").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE goals ADD COLUMN status TEXT DEFAULT 'PENDING'").run();
} catch (e) {}

// Migration: Ensure tasks table has attachment column
try {
  db.prepare("ALTER TABLE tasks ADD COLUMN attachment TEXT").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE tasks ADD COLUMN assignment_type TEXT DEFAULT 'INDIVIDUAL'").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE tasks ADD COLUMN start_date TEXT").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE goals ADD COLUMN start_date TEXT").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE goals ADD COLUMN completed_at DATETIME").run();
} catch (e) {}

// Seed Admin if not exists
const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("diego@papadog.com.br");
if (!admin) {
  db.prepare("INSERT INTO users (name, email, password, role, avatar, level) VALUES (?, ?, ?, ?, ?, ?)").run(
    "Diego Boechat",
    "diego@papadog.com.br",
    "admin123",
    "ADMIN",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    "Diamante"
  );
  
  // Seed a regular user for testing
  db.prepare("INSERT INTO users (name, email, password, role, avatar, level) VALUES (?, ?, ?, ?, ?, ?)").run(
    "João Gabriel Souza",
    "joao@papadog.com.br",
    "user123",
    "USER",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    "Bronze"
  );
}

// Seed Douglas if not exists
const douglas = db.prepare("SELECT * FROM users WHERE email = ?").get("douglas@papadog.com.br");
if (!douglas) {
  db.prepare("INSERT INTO users (name, email, password, role, avatar, level) VALUES (?, ?, ?, ?, ?, ?)").run(
    "Douglas Cabral",
    "douglas@papadog.com.br",
    "douglas123",
    "USER",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Douglas",
    "Bronze"
  );
}

// Update existing user names if they were seeded with old names
db.prepare("UPDATE users SET name = ? WHERE email = ? AND name = ?").run("João Gabriel Souza", "joao@papadog.com.br", "João Silva");
db.prepare("UPDATE users SET name = ? WHERE email = ? AND name = ?").run("Douglas Cabral", "douglas@papadog.com.br", "Douglas");

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, name, email, role, avatar, points, level FROM users").all();
    res.json(users);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, email, role, avatar, points, level FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  });

  app.patch("/api/users/:id/avatar", (req, res) => {
    const { id } = req.params;
    const { avatar } = req.body;
    db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, id);
    res.json({ success: true });
  });

  app.patch("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?").run(name, email, role, id);
    res.json({ success: true });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    // Don't allow deleting the main admin
    if (id === "1") return res.status(403).json({ error: "Não é possível excluir o administrador principal" });
    
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    // Also delete related tasks and notifications
    db.prepare("DELETE FROM tasks WHERE assigned_to = ?").run(id);
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/users/create", (req, res) => {
    const { name, email, password, role, avatar } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, password, role, avatar, level) VALUES (?, ?, ?, ?, ?, ?)").run(
        name, email, password, role, avatar, 'Bronze'
      );
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: "E-mail já cadastrado ou dados inválidos" });
    }
  });

  app.get("/api/goals", (req, res) => {
    const { userId, type } = req.query;
    let goals;
    if (type === 'COMPANY') {
      goals = db.prepare(`
        SELECT g.*, GROUP_CONCAT(ga.user_id) as assigned_users
        FROM goals g
        LEFT JOIN goal_assignments ga ON g.id = ga.goal_id
        WHERE g.type = 'COMPANY'
        GROUP BY g.id
      `).all();
    } else {
      goals = db.prepare(`
        SELECT g.*, GROUP_CONCAT(ga.user_id) as assigned_users
        FROM goals g
        LEFT JOIN goal_assignments ga ON g.id = ga.goal_id
        WHERE g.user_id = ? OR ga.user_id = ?
        GROUP BY g.id
      `).all(userId, userId);
    }
    
    // Parse assigned_users string to array
    goals = goals.map(g => ({
      ...g,
      assigned_users: g.assigned_users ? g.assigned_users.split(',').map(Number) : []
    }));
    
    res.json(goals);
  });

  app.post("/api/goals", (req, res) => {
    const { title, target_value, type, frequency, user_id, assigned_users, start_date } = req.body;
    try {
      const result = db.prepare("INSERT INTO goals (title, target_value, type, frequency, user_id, start_date) VALUES (?, ?, ?, ?, ?, ?)").run(
        title, target_value, type, frequency, user_id, start_date
      );
      const goalId = result.lastInsertRowid;
      
      if (type === 'COMPANY' && assigned_users && Array.isArray(assigned_users)) {
        const stmt = db.prepare("INSERT INTO goal_assignments (goal_id, user_id) VALUES (?, ?)");
        for (const uid of assigned_users) {
          stmt.run(goalId, uid);
        }
      }
      
      res.json({ id: goalId });
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ error: "Erro ao criar meta. Verifique se todos os campos estão corretos." });
    }
  });

  app.patch("/api/goals/:id", (req, res) => {
    const { id } = req.params;
    const { current_value, status, title, target_value, frequency, type, assigned_users } = req.body;
    
    if (status) {
      const completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
      db.prepare("UPDATE goals SET status = ?, completed_at = ? WHERE id = ?").run(status, completedAt, id);
    } else if (current_value !== undefined && title === undefined) {
      db.prepare("UPDATE goals SET current_value = ? WHERE id = ?").run(current_value, id);
    } else if (title !== undefined) {
      db.prepare("UPDATE goals SET title = ?, target_value = ?, frequency = ?, type = ? WHERE id = ?").run(
        title, target_value, frequency, type, id
      );
      
      if (type === 'COMPANY' && assigned_users && Array.isArray(assigned_users)) {
        db.prepare("DELETE FROM goal_assignments WHERE goal_id = ?").run(id);
        const stmt = db.prepare("INSERT INTO goal_assignments (goal_id, user_id) VALUES (?, ?)");
        for (const uid of assigned_users) {
          stmt.run(id, uid);
        }
      }
    }
    
    res.json({ success: true });
  });

  app.delete("/api/goals/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM goals WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/tasks", (req, res) => {
    const { userId, role } = req.query;
    let tasks;
    if (role === 'ADMIN') {
      tasks = db.prepare(`
        SELECT t.*, u.name as assigned_name, GROUP_CONCAT(ta.user_id) as assigned_users
        FROM tasks t 
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN task_assignments ta ON t.id = ta.task_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `).all();
    } else {
      tasks = db.prepare(`
        SELECT t.*, u.name as assigned_name, GROUP_CONCAT(ta.user_id) as assigned_users
        FROM tasks t 
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN task_assignments ta ON t.id = ta.task_id
        WHERE t.assigned_to = ? OR ta.user_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `).all(userId, userId);
    }
    
    tasks = tasks.map(t => ({
      ...t,
      assigned_users: t.assigned_users ? t.assigned_users.split(',').map(Number) : []
    }));
    
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, description, assigned_to, priority, due_date, start_date, attachment, assignment_type, assigned_users } = req.body;
    const result = db.prepare("INSERT INTO tasks (title, description, assigned_to, priority, due_date, start_date, attachment, assignment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      title, description, assignment_type === 'INDIVIDUAL' ? assigned_to : null, priority, due_date, start_date, attachment, assignment_type
    );
    const taskId = result.lastInsertRowid;
    
    if (assignment_type === 'GROUP' && assigned_users && Array.isArray(assigned_users)) {
      const stmt = db.prepare("INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)");
      for (const uid of assigned_users) {
        stmt.run(taskId, uid);
      }
    }
    
    res.json({ id: taskId });
  });

  app.patch("/api/tasks/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const completed_at = status === 'COMPLETED' ? new Date().toISOString() : null;
    db.prepare("UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?").run(status, completed_at, id);
    
    // Notify admin if completed
    if (status === 'COMPLETED') {
      const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(task.assigned_to);
      
      if (user) {
        const notification = db.prepare("INSERT INTO notifications (user_id, type, message, task_id) VALUES (?, ?, ?, ?)").run(
          1, // Admin ID (Diego)
          'TASK_COMPLETED',
          `${user.name} concluiu a tarefa: ${task.title}`,
          id
        );
        
        io.emit('admin_notification', {
          id: notification.lastInsertRowid,
          message: `${user.name} concluiu a tarefa: ${task.title}`,
          taskId: id
        });
      }
    }
    
    res.json({ success: true });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, assigned_to, priority, due_date, start_date, attachment, assignment_type, assigned_users } = req.body;
    
    db.prepare("UPDATE tasks SET title = ?, description = ?, assigned_to = ?, priority = ?, due_date = ?, start_date = ?, attachment = ?, assignment_type = ? WHERE id = ?").run(
      title, description, assignment_type === 'INDIVIDUAL' ? assigned_to : null, priority, due_date, start_date, attachment, assignment_type, id
    );
    
    if (assignment_type === 'GROUP' && assigned_users && Array.isArray(assigned_users)) {
      db.prepare("DELETE FROM task_assignments WHERE task_id = ?").run(id);
      const stmt = db.prepare("INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)");
      for (const uid of assigned_users) {
        stmt.run(id, uid);
      }
    }
    
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    db.prepare("DELETE FROM task_assignments WHERE task_id = ?").run(id);
    db.prepare("DELETE FROM praise WHERE task_id = ?").run(id);
    db.prepare("DELETE FROM notifications WHERE task_id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/praise", (req, res) => {
    const { admin_id, user_id, task_id, message, points, type } = req.body;
    
    const result = db.prepare("INSERT INTO praise (admin_id, user_id, task_id, message, points_awarded, type) VALUES (?, ?, ?, ?, ?, ?)").run(
      admin_id, user_id, task_id, message, points, type
    );
    
    const praiseId = result.lastInsertRowid;
    
    // Update user points and level
    if (type === 'PRAISE') {
      db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(points, user_id);
      
      // Simple level logic
      const user = db.prepare("SELECT points FROM users WHERE id = ?").get(user_id);
      let newLevel = 'Bronze';
      if (user.points >= 5000) newLevel = 'Diamante';
      else if (user.points >= 2500) newLevel = 'Platina';
      else if (user.points >= 1000) newLevel = 'Ouro';
      else if (user.points >= 500) newLevel = 'Prata';
      
      db.prepare("UPDATE users SET level = ? WHERE id = ?").run(newLevel, user_id);
    }

    // Create persistent notification
    const notification = db.prepare("INSERT INTO notifications (user_id, type, message, task_id, praise_id) VALUES (?, ?, ?, ?, ?)").run(
      user_id,
      type,
      message,
      task_id,
      praiseId
    );

    io.to(`user_${user_id}`).emit('new_praise', {
      id: notification.lastInsertRowid,
      message,
      points,
      type,
      task_id,
      admin_name: "Diego Boechat"
    });

    res.json({ success: true });
  });

  app.get("/api/notifications/:userId", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC").all(req.params.userId);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    // Sector efficiency based on approved tasks and goal progress
    // Approved tasks are those that have a praise entry with points_awarded > 0
    const totalTasks = db.prepare("SELECT COUNT(*) as count FROM tasks").get().count;
    const approvedTasks = db.prepare(`
      SELECT COUNT(DISTINCT task_id) as count 
      FROM praise 
      WHERE points_awarded > 0
    `).get().count;
    
    const goals = db.prepare("SELECT target_value, current_value FROM goals").all();
    let totalGoalProgress = 0;
    if (goals.length > 0) {
      totalGoalProgress = goals.reduce((acc, g) => {
        const progress = g.target_value > 0 ? (g.current_value / g.target_value) : 0;
        return acc + progress;
      }, 0) / goals.length;
    }
    
    const taskEfficiency = totalTasks > 0 ? (approvedTasks / totalTasks) : 1;
    const sectorEfficiency = ((taskEfficiency * 0.6) + (totalGoalProgress * 0.4)) * 100;

    const total = totalTasks;
    const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'COMPLETED'").get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'PENDING'").get().count;
    const overdue = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'PENDING' AND due_date < date('now')").get().count;
    
    const ranking = db.prepare("SELECT name, points, level, avatar FROM users ORDER BY points DESC LIMIT 5").all();
    
    // Weekly performance data for tasks and goals
    // We'll calculate task completions by day for the last 7 days
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const approvedTasksCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM praise 
        WHERE points_awarded > 0 
        AND date(created_at) = date(?)
      `).get(dateStr).count;

      const goalsCompleted = db.prepare(`
        SELECT COUNT(*) as count 
        FROM goals 
        WHERE status = 'COMPLETED' 
        AND date(completed_at) = date(?)
      `).get(dateStr).count;

      chartData.push({
        name: dayName,
        tarefas: approvedTasksCount,
        metas: goalsCompleted
      });
    }
    
    res.json({ 
      total, 
      completed, 
      pending, 
      overdue, 
      ranking, 
      sectorEfficiency: sectorEfficiency.toFixed(1), 
      chartData 
    });
  });

  // Socket.io connection
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
    });
  });

  // Vite setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://0.0.0.0:3000");
  });
}

startServer();
