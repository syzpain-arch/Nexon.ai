import cron from 'node-cron';
import { db } from '../models/db.js';
import { wsService } from './wsService.js';
import { logger } from '../utils/logger.js';
import { metricsRegistry } from '../utils/metrics.js';

class CronSchedulerService {
  private isRunning: boolean = false;
  private cronJob: any = null;
  private lastRunTime: string | null = null;

  public start(): void {
    if (this.isRunning) return;

    // Run evaluation every 30 seconds
    this.cronJob = cron.schedule('*/30 * * * * *', () => {
      this.evaluatePendingTasks();
    });

    this.isRunning = true;
    logger.system('CronSchedulerService', 'Autonomous cron task evaluator started (interval: 30s)');
  }

  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    logger.info('CronSchedulerService', 'Cron scheduler stopped');
  }

  public evaluatePendingTasks(): void {
    this.lastRunTime = new Date().toISOString();
    metricsRegistry.incrementCronExecution();

    const tasks = db.getAllTasks();
    const now = Date.now();

    let alertsTriggered = 0;

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue;

      const dueTime = new Date(task.dueDate).getTime();
      const timeDiffMs = dueTime - now;

      // If task is due within the next 60 minutes and reminder has not been dispatched yet
      // Or if task is overdue
      if (timeDiffMs <= 60 * 60 * 1000 && !task.reminderSent) {
        db.updateTask(task.id, { reminderSent: true });

        const isOverdue = timeDiffMs < 0;
        const alertPayload = {
          task,
          isOverdue,
          timeRemainingMinutes: Math.round(timeDiffMs / (60 * 1000)),
          alertMessage: isOverdue
            ? `⚠️ PRIORITY ALERT: Task "${task.title}" is overdue (${Math.abs(Math.round(timeDiffMs / (60 * 1000)))} mins ago)!`
            : `🔔 UPCOMING TASK: "${task.title}" is due in ${Math.max(1, Math.round(timeDiffMs / (60 * 1000)))} minutes.`,
        };

        wsService.broadcast('TASK_DUE_REMINDER', alertPayload);
        alertsTriggered++;

        logger.warn(
          'CronSchedulerService',
          `Triggered real-time WebSocket reminder for task: ${task.title} (due: ${task.dueDate})`
        );
      }
    }

    if (alertsTriggered > 0) {
      logger.info('CronSchedulerService', `Evaluation completed: ${alertsTriggered} automated reminders broadcasted.`);
    }
  }

  public getStatus() {
    return {
      active: this.isRunning,
      interval: '30 seconds',
      lastRun: this.lastRunTime,
    };
  }
}

export const cronSchedulerService = new CronSchedulerService();
