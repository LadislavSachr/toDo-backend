const express = require('express');
const { getTasks, deleteTask, addTask } = require('../database/tasks');
const { body } = require('express-validator');

const router = express.Router();

// middleware to check if a person making the request is authenticated/logged in
function authenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).json({message:'Not authenticated no make this request'})
    }
}

// fetches a users tasks from database and sends them
router.get('/', authenticated, async (req,res)=>{
    try{
        const response = await getTasks(req.user.id);
        res.status(200).send(response.rows);
    }catch(error){
        res.status(500).json({message:error.message})
    }
})

// adds a new task to database
router.post('/',
    authenticated,
    [body('task').trim().escape()], // trims the text of task and escapes [changes special character] to protect database
    async (req,res)=>{
    const { task_id, task, category } = req.body;
    try{
        const response = await addTask(req.user.id, task_id, task, category);
        res.status(201).json({message:'Task added!', sanitized: task}); // responds with sanitized task so we can instantly show it in frontend
    }catch(error){
        res.status(500).json({message:error.message})
    }
})

// deletes a task from database
router.delete('/:taskId', authenticated, async (req,res)=>{
    const id = req.params.taskId;
    try{
        const response = await deleteTask(req.user.id,id);
        res.status(204).json({message:'Task deleted!'});
    }catch(error){
        res.status(500).json({message:error.message})
    }
})

module.exports = router;