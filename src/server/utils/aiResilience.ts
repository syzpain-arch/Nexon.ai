import { logger } from './logger.js';

class AiResilienceManager {
  private cooldownUntil: number = 0;
  private lastWarningTime: number = 0;

  /**
   * Check if Gemini API is currently in a quota / rate-limit cooldown window
   */
  public isCoolingDown(): boolean {
    return Date.now() < this.cooldownUntil;
  }

  public getRemainingCooldownSeconds(): number {
    const remaining = Math.max(0, Math.ceil((this.cooldownUntil - Date.now()) / 1000));
    return remaining;
  }

  /**
   * Trigger cooldown when 429 / quota error is encountered
   */
  public triggerCooldown(durationSeconds: number = 60, reason: string = 'Quota limit / 429'): void {
    this.cooldownUntil = Date.now() + durationSeconds * 1000;
    const now = Date.now();
    // Throttle warning log to once per 15s to prevent console spam
    if (now - this.lastWarningTime > 15000) {
      this.lastWarningTime = now;
      logger.warn(
        'AiResilience',
        `Gemini API ${reason}. Activating autonomous synthetic intelligence fallback (${durationSeconds}s cooldown).`
      );
    }
  }

  /**
   * Parse error and return clean human-readable summary without raw JSON dump
   */
  public handleAiError(source: string, err: any): { isQuota: boolean; cleanMessage: string } {
    const rawMsg = typeof err === 'string' ? err : err?.message || JSON.stringify(err || {});
    const isQuota =
      rawMsg.includes('429') ||
      rawMsg.includes('RESOURCE_EXHAUSTED') ||
      rawMsg.includes('quota') ||
      rawMsg.includes('rate limit') ||
      rawMsg.includes('exceeded your current quota');

    if (isQuota) {
      this.triggerCooldown(60, 'quota exceeded (429 RESOURCE_EXHAUSTED)');
      return {
        isQuota: true,
        cleanMessage: 'Gemini API quota exceeded (429 RESOURCE_EXHAUSTED). Using autonomous fallback engine.',
      };
    }

    // Shorten any overly verbose error messages
    let cleanMessage = rawMsg;
    try {
      if (rawMsg.startsWith('{') && rawMsg.endsWith('}')) {
        const parsed = JSON.parse(rawMsg);
        if (parsed.error?.message) {
          cleanMessage = parsed.error.message;
        }
      }
    } catch {}

    if (cleanMessage.length > 150) {
      cleanMessage = cleanMessage.substring(0, 147) + '...';
    }

    logger.warn(source, `${source} call issue: ${cleanMessage}. Using synthetic fallback.`);
    return { isQuota: false, cleanMessage };
  }
}

export const aiResilience = new AiResilienceManager();
