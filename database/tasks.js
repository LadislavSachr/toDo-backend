const { query } = require('./pool');

// gets all tasks based on user_id
exports.getTasks = (userId) => {
    return query('SELECT task_id, task, category FROM tasks WHERE user_id = $1',[userId])
}

// deletes a task based on user_id and task_id
exports.deleteTask = (userId,taskId) => {
    return query('DELETE FROM tasks WHERE task_id = $1 AND user_id = $2',[taskId,userId]);
}

// adds new task
exports.addTask = (userId, taskId, task, category) => {
    return query('INSERT INTO tasks (user_id, task_id, task, category) VALUES ($1,$2,$3,$4)',[userId,taskId,task,category])
}