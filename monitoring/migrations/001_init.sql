-- =============================================================================
-- Migração 001 — Esquema do Serviço Isolado de Monitoramento (ME Guinchos)
-- =============================================================================
-- Separação estrita entre:
-- 1. Requisições / Eventos (`access_events` -> cada linha válida)
-- 2. Visitas / Sessões (`session_id` + `is_new_visit = TRUE` na abertura da sessão)
-- 3. Entradas Pagas Identificadas (`is_paid_entry = TRUE`, deduplicada por sessão/click_id;
--    NÃO representa clique faturado pelo Google Ads, mas sim entrada paga identificada no site)
-- 4. Eventos de Contato (`event_type IN ('whatsapp_click', 'phone_click')`)
-- =============================================================================

CREATE TABLE IF NOT EXISTS access_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identificação de Rede e Auditoria de Proxy
  ip_address INET NOT NULL,
  ip_source VARCHAR(32) NOT NULL,
  ip_header_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
  spoof_attempt_detected BOOLEAN NOT NULL DEFAULT FALSE,

  -- Identificação de Sessão, Idempotência e Visita
  session_id UUID NOT NULL,
  event_id UUID,
  is_new_visit BOOLEAN NOT NULL DEFAULT FALSE,

  -- Classificação do Evento
  event_type VARCHAR(24) NOT NULL CHECK (event_type IN ('page_view', 'whatsapp_click', 'phone_click')),
  page_path VARCHAR(255) NOT NULL,
  button_location VARCHAR(64),
  contact_target VARCHAR(128),

  -- Atribuição de Tráfego e Entradas Pagas Identificadas
  traffic_category VARCHAR(24) NOT NULL CHECK (traffic_category IN ('paid_google', 'paid_other', 'organic', 'direct', 'referral')),
  is_paid_entry BOOLEAN NOT NULL DEFAULT FALSE,
  paid_click_type VARCHAR(16) CHECK (paid_click_type IN ('gclid', 'wbraid', 'gbraid', 'utm_paid')),
  paid_click_id VARCHAR(128),
  utm_source VARCHAR(128),
  utm_medium VARCHAR(128),
  utm_campaign VARCHAR(128),
  utm_term VARCHAR(128),
  utm_content VARCHAR(128),
  referrer_origin VARCHAR(255),

  -- Metadados Técnicos Minimizados (LGPD — sem User-Agent bruto completo)
  browser_family VARCHAR(32) NOT NULL,
  os_family VARCHAR(32) NOT NULL,
  device_type VARCHAR(16) NOT NULL CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'bot', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_access_events_created_at ON access_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_events_ip_created ON access_events (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_events_session ON access_events (session_id, created_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_events_event_id ON access_events (event_id) WHERE event_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_events_unique_paid_entry ON access_events (session_id, COALESCE(paid_click_id, '')) WHERE is_paid_entry = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_events_unique_utm_paid_per_session ON access_events (session_id) WHERE is_paid_entry = TRUE AND paid_click_type = 'utm_paid';
CREATE INDEX IF NOT EXISTS idx_access_events_paid_entry ON access_events (is_paid_entry, created_at DESC) WHERE is_paid_entry = TRUE;
CREATE INDEX IF NOT EXISTS idx_access_events_event_type ON access_events (event_type, created_at DESC);

-- Registro Manual de IPs Investigados (sem bloqueio automático)
CREATE TABLE IF NOT EXISTS investigated_ips (
  ip_address INET PRIMARY KEY,
  status VARCHAR(32) NOT NULL CHECK (status IN ('em_observacao', 'suspeito_ads', 'legitimo_recorrente', 'ignorado')),
  notes TEXT NOT NULL DEFAULT '',
  first_flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(64) NOT NULL DEFAULT 'admin'
);

-- Usuários e Sessões Administrativas (Painel Privado)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions (expires_at);

-- Função de Expurgo Automático (LGPD — Retenção padrão de 30 dias)
CREATE OR REPLACE FUNCTION purge_expired_monitoring_data(retention_days INT DEFAULT 30)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  IF retention_days < 1 THEN
    RAISE EXCEPTION 'retention_days deve ser maior ou igual a 1';
  END IF;

  DELETE FROM access_events
  WHERE created_at < NOW() - make_interval(days => retention_days);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM admin_sessions
  WHERE expires_at < NOW();

  RETURN deleted_count;
END;
$$;
