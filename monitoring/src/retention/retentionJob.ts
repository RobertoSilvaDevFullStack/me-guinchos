import type { MonitoringRepository } from "../db/repository.ts";

export const DEFAULT_RETENTION_DAYS = 30;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Gerenciador da política de retenção automática de dados (LGPD — 30 dias).
 * Executa o expurgo inicial na subida do serviço e agenda execuções periódicas a cada 24h.
 */
export class RetentionScheduler {
  private readonly repo: MonitoringRepository;
  private readonly retentionDays: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    repo: MonitoringRepository,
    retentionDays: number = DEFAULT_RETENTION_DAYS,
  ) {
    this.repo = repo;
    this.retentionDays = Math.max(1, Math.min(365, Math.floor(retentionDays)));
  }

  public async runOnce(now: Date = new Date()): Promise<number> {
    return this.repo.purgeExpiredData(this.retentionDays, now);
  }

  public start(): void {
    if (this.timer) return;
    void this.runOnce().catch(() => {
      // Silencioso para nunca derrubar o processo em caso de instabilidade transitória
    });
    this.timer = setInterval(() => {
      void this.runOnce().catch(() => {});
    }, TWENTY_FOUR_HOURS_MS);
    this.timer.unref?.();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
