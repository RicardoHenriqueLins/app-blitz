CREATE DATABASE IF NOT EXISTS bd_blitzseguranca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bd_blitzseguranca;

CREATE TABLE IF NOT EXISTS blitiz (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(255),
  unidade         VARCHAR(100),
  tipo_colaborador VARCHAR(50),
  turno           VARCHAR(50),
  setor           VARCHAR(50),
  checklist       TEXT,
  outros_pontos   TEXT,
  reforco_positivo VARCHAR(10),
  feedback_positivo VARCHAR(10),
  orientacoes     TEXT,
  melhorias       TEXT,
  observacao_oportunidades TEXT,
  tipo_relato     VARCHAR(100),
  observacoes     TEXT,
  data_registro   DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alerta (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(255),
  re               VARCHAR(50),
  area_emitente    VARCHAR(100),
  turno            VARCHAR(50),
  Data_ocorrencia  DATE,
  horario          TIME,
  tipo_colaborador VARCHAR(50),
  empresa          VARCHAR(255),
  area_ocorrencia  VARCHAR(100),
  local            VARCHAR(255),
  descricao        TEXT,
  acoes            TEXT,
  tipo_relato      VARCHAR(100),
  data_registro    DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: acidente
-- ============================================================
CREATE TABLE IF NOT EXISTS acidente (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  unidade       VARCHAR(100) NOT NULL UNIQUE,
  data_acidente DATE NOT NULL,
  recorde_dias  INT DEFAULT 0,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO acidente (unidade, data_acidente, recorde_dias) VALUES
  ('432 - Salvador',     '2024-09-10', 210),
  ('GMA - Aratu',        '2025-03-22', 180),
  ('GMA - Almoxarifado', '2025-05-01', 95),
  ('GMA - 31F',          '2024-11-14', 320)
ON DUPLICATE KEY UPDATE unidade = unidade;