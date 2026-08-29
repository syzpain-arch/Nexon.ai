import { db } from '../models/db.js';
import { Task } from '../types/index.js';
import { geminiService } from './geminiService.js';
import { wsService } from './wsService.js';
import { logger } from '../utils/logger.js';

class TaskService {
  public getAllTasks(filter?: { status?: string; priority?: string; search?: string }): Task[] {
    let tasks = db.getAllTasks();

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        tasks = tasks.filter((t) => t.status === filter.status);
      }
      if (filter.priority && filter.priority !== 'all') {
        tasks = tasks.filter((t) => t.priority === filter.priority);
      }
      if (filter.search) {
        const query = filter.search.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query)) ||
            t.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
    }

    return tasks;
  }

  public getTaskById(id: string): Task | null {
    return db.getTaskById(id) || null;
  }

  public async createTaskFromRawText(rawText: string, source: Task['source'] = 'nlp'): Promise<Task> {
    logger.info('TaskService', `Parsing task from raw command: "${rawText}"`);
    const parsed = await geminiService.parseTaskFromNaturalLanguage(rawText);

    const newTask = db.createTask({
      title: parsed.title || rawText,
      description: parsed.description || `Extracted from: "${rawText}"`,
      dueDate: parsed.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: parsed.priority || 'medium',
      status: 'pending',
      tags: parsed.tags || ['Automated'],
      source,
    });

    wsService.broadcast('TASK_CREATED', newTask);
    logger.system('TaskService', `Task created successfully [${newTask.id}] - ${newTask.title}`);
    return newTask;
  }

  public createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask = db.createTask(data);
    wsService.broadcast('TASK_CREATED', newTask);
    logger.info('TaskService', `Manual task created: ${newTask.title}`);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const updated = db.updateTask(id, updates);
    if (updated) {
      wsService.broadcast('TASK_UPDATED', updated);
      logger.info('TaskService', `Task updated [${id}]`);
    }
    return updated;
  }

  public deleteTask(id: string): boolean {
    const success = db.deleteTask(id);
    if (success) {
      wsService.broadcast('TASK_UPDATED', { id, deleted: true });
      logger.info('TaskService', `Task deleted [${id}]`);
    }
    return success;
  }
}

export const taskService = new TaskService();
