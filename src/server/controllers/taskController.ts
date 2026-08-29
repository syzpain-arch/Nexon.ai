import { Request, Response } from 'express';
import { taskService } from '../services/taskService.js';
import { cronSchedulerService } from '../services/cronService.js';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { status, priority, search } = req.query;
  const tasks = taskService.getAllTasks({
    status: status as string,
    priority: priority as string,
    search: search as string,
  });
  res.json({ success: true, count: tasks.length, data: tasks });
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const task = taskService.getTaskById(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, data: task });
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, rawCommand, description, dueDate, priority, tags, status } = req.body;

  // If rawCommand is provided (e.g. "Remind me to call John tomorrow at 5 PM"), parse it with NLP
  if (rawCommand && (!title || rawCommand.length > title.length)) {
    const parsedTask = await taskService.createTaskFromRawText(rawCommand, 'nlp');
    res.status(201).json({ success: true, message: 'Task parsed & scheduled via NLP engine', data: parsedTask });
    return;
  }

  if (!title) {
    res.status(400).json({ success: false, error: 'Task title or rawCommand is required' });
    return;
  }

  const newTask = taskService.createTask({
    title,
    description,
    dueDate: dueDate || new Date(Date.now() + 24 * 3600000).toISOString(),
    priority: priority || 'medium',
    status: status || 'pending',
    tags: tags || ['Direct'],
    source: 'direct',
  });

  res.status(201).json({ success: true, message: 'Task created successfully', data: newTask });
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const updated = taskService.updateTask(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, message: 'Task updated successfully', data: updated });
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const deleted = taskService.deleteTask(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, message: 'Task deleted successfully' });
};

export const triggerCronEvaluation = async (req: Request, res: Response): Promise<void> => {
  cronSchedulerService.evaluatePendingTasks();
  res.json({ success: true, message: 'Cron evaluation cycle executed immediately', status: cronSchedulerService.getStatus() });
};
