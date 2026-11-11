-- Депозитарии и правила принадлежности данных (счета, тэги, классы).
-- Сервер выполняет этот же скрипт при старте (CREATE ... IF NOT EXISTS), вручную запускать не обязательно.

CREATE TABLE IF NOT EXISTS depositories (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL UNIQUE,
  api_key_hash  CHAR(64)    UNIQUE,          -- SHA-256 ключа; сам ключ не хранится
  api_key_hint  VARCHAR(16),                 -- последние символы ключа для отображения в админке
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- resource:   depo_account (DepoLimits.Trdacc / TRDACCID),
--             money_tag    (MoneyLimits.Tag / TAG),
--             trade_class  (Trades.ClassCode)
-- match_type: exact | prefix | contains | default ("все остальные", value = '')
CREATE TABLE IF NOT EXISTS depository_rules (
  id             SERIAL PRIMARY KEY,
  depository_id  INTEGER     NOT NULL REFERENCES depositories(id) ON DELETE CASCADE,
  resource       VARCHAR(20) NOT NULL CHECK (resource IN ('depo_account', 'money_tag', 'trade_class')),
  match_type     VARCHAR(10) NOT NULL CHECK (match_type IN ('exact', 'prefix', 'contains', 'default')),
  value          TEXT        NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Одно и то же правило (и одно правило "все остальные" на ресурс) может принадлежать только одному депозитарию.
CREATE UNIQUE INDEX IF NOT EXISTS ux_depository_rules_value
  ON depository_rules (resource, match_type, UPPER(value));
