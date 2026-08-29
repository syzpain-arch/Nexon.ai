export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  meta?: Record<string, any>;
}

class CentralizedLogger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 200;

  public log(level: LogLevel, module: string, message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      meta,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const color =
      level === 'ERROR'
        ? '\x1b[31m'
        : level === 'WARN'
        ? '\x1b[33m'
        : level === 'SYSTEM'
        ? '\x1b[36m'
        : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${color}[${entry.timestamp}] [${level}] [${module}]${reset} ${message}`, meta ? JSON.stringify(meta) : '');
  }

  public info(module: string, message: string, meta?: Record<string, any>) {
    this.log('INFO', module, message, meta);
  }

  public warn(module: string, message: string, meta?: Record<string, any>) {
    this.log('WARN', module, message, meta);
  }

  public error(module: string, message: string, meta?: Record<string, any>) {
    this.log('ERROR', module, message, meta);
  }

  public system(module: string, message: string, meta?: Record<string, any>) {
    this.log('SYSTEM', module, message, meta);
  }

  public getRecentLogs(limit: number = 50, level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((l) => l.level === level).slice(0, limit);
    }
    return this.logs.slice(0, limit);
  }

  public clear(): void {
    this.logs = [];
  }
}

export const logger = new CentralizedLogger();
