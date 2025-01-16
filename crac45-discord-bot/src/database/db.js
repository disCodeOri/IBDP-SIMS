// src/database/db.js

const db = {
  users: {},
  tasks: [],

  async createUser(userId) {
    if (!db.users[userId]) {
      db.users[userId] = { id: userId, streak: 0, points: 0, last_logged_date: null };
    }
    return db.users[userId];
  },

  async logTask(userId, taskName) {
    const user = await this.createUser(userId);
    user.streak = user.last_logged_date && new Date().toDateString() === user.last_logged_date ? user.streak + 1 : 1;
    user.points += 10;
    user.last_logged_date = new Date().toDateString();
    db.tasks.push({ userId, taskName, timestamp: new Date() });
    return user;
  },

  async getUser(userId) {
    return db.users[userId]
  },

  async getLeaderboard() {
    const users = Object.values(db.users)
    users.sort((a,b) => b.points - a.points);
    return users;
  }
};

module.exports = db;