-- ============================================================
--  M. Dias Branco — Segurança do Trabalho (Regional BA)
--  Inicialização do banco bd_blitzseguranca
--  Schema derivado dos repositories (alerta, blitiz, acidente, unidade)
-- ============================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS bd_blitzseguranca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bd_blitzseguranca;

-- ------------------------------------------------------------
--  UNIDADE  (Cadastro de Unidades)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidade (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  cidade      VARCHAR(100)  NOT NULL,
  uf          CHAR(2)       NOT NULL,
  ativo       TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_unidade_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  ALERTA  (Alerta de Segurança)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerta (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome              VARCHAR(150)  DEFAULT NULL,
  re                VARCHAR(20)   DEFAULT NULL,
  unidade           VARCHAR(100)  DEFAULT NULL,
  area_emitente     VARCHAR(80)   DEFAULT NULL,
  turno             VARCHAR(20)   DEFAULT NULL,
  Data_ocorrencia   DATE          DEFAULT NULL,
  horario           TIME          DEFAULT NULL,
  tipo_colaborador  VARCHAR(20)   DEFAULT NULL,
  empresa           VARCHAR(120)  DEFAULT NULL,
  area_ocorrencia   VARCHAR(80)   DEFAULT NULL,
  local             VARCHAR(120)  DEFAULT NULL,
  descricao         TEXT          DEFAULT NULL,
  acoes             TEXT          DEFAULT NULL,
  tipo_relato       VARCHAR(30)   DEFAULT NULL,
  data_registro     DATETIME      DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_alerta_turno (turno),
  KEY idx_alerta_tipo  (tipo_relato)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  BLITIZ  (Blitz de Segurança)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blitiz (
  id                        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                      VARCHAR(150) DEFAULT NULL,
  unidade                   VARCHAR(50)  DEFAULT NULL,
  tipo_colaborador          VARCHAR(20)  DEFAULT NULL,
  turno                     VARCHAR(20)  DEFAULT NULL,
  setor                     VARCHAR(30)  DEFAULT NULL,
  checklist                 LONGTEXT     DEFAULT NULL,
  outros_pontos             TEXT         DEFAULT NULL,
  reforco_positivo          VARCHAR(10)  DEFAULT NULL,
  feedback_positivo         VARCHAR(10)  DEFAULT NULL,
  orientacoes               TEXT         DEFAULT NULL,
  melhorias                 TEXT         DEFAULT NULL,
  observacao_oportunidades  TEXT         DEFAULT NULL,
  tipo_relato               VARCHAR(30)  DEFAULT NULL,
  observacoes               TEXT         DEFAULT NULL,
  data_registro             DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_blitiz_unidade (unidade),
  KEY idx_blitiz_turno   (turno),
  KEY idx_blitiz_setor   (setor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  ACIDENTE  (Dias sem acidente por unidade)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acidente (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  unidade        VARCHAR(50) NOT NULL,
  data_acidente  DATE        DEFAULT NULL,
  recorde_dias   INT         NOT NULL DEFAULT 0,
  updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_acidente_unidade (unidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  Seed: Unidades
-- ------------------------------------------------------------
INSERT INTO unidade (nome, cidade, uf) VALUES
  ('432 - Salvador',      'Salvador',  'BA'),
  ('GMA - Aratu',         'Candeias',  'BA'),
  ('GMA - Almoxarifado',  'Salvador',  'BA'),
  ('GMA - 31F',           'Salvador',  'BA')
ON DUPLICATE KEY UPDATE cidade = VALUES(cidade);

-- ------------------------------------------------------------
--  Seed: Acidentes
-- ------------------------------------------------------------
INSERT INTO acidente (unidade, data_acidente, recorde_dias) VALUES
  ('432 - Salvador',      '2025-05-10', 220),
  ('GMA - Aratu',         '2025-06-01', 180),
  ('GMA - Almoxarifado',  '2025-04-15', 365),
  ('GMA - 31F',           '2025-06-20', 150)
ON DUPLICATE KEY UPDATE data_acidente = VALUES(data_acidente);

-- ============================================================
--  TABELA: ocorrencia (Pirâmide de Segurança)
--  Tipos: fatal, caf, saf, incidente
-- ============================================================

USE bd_blitzseguranca;

CREATE TABLE IF NOT EXISTS ocorrencia (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo                 VARCHAR(20)   NOT NULL COMMENT 'fatal, caf, saf, incidente',
  unidade              VARCHAR(100)  DEFAULT NULL,
  empresa_local        VARCHAR(150)  DEFAULT NULL,
  data_ocorrencia      DATE          DEFAULT NULL,
  hora_ocorrencia      TIME          DEFAULT NULL,
  nome_colaborador     VARCHAR(150)  DEFAULT NULL,
  funcao               VARCHAR(100)  DEFAULT NULL,
  tipo_colaborador     VARCHAR(20)   DEFAULT NULL COMMENT 'proprio, terceiro',
  empresa_terceiro     VARCHAR(150)  DEFAULT NULL,
  local_especifico     VARCHAR(200)  DEFAULT NULL,
  descricao            TEXT          DEFAULT NULL,
  primeiros_socorros   VARCHAR(10)   DEFAULT NULL COMMENT 'Sim, Não',
  atestado_dias        INT           DEFAULT 0,
  cid                  VARCHAR(30)   DEFAULT NULL,
  cat_aberta           VARCHAR(20)   DEFAULT NULL COMMENT 'Sim, Não, Aguardando',
  acoes_imediatas      TEXT          DEFAULT NULL,
  observacoes          TEXT          DEFAULT NULL,
  data_registro        DATETIME      DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_ocorrencia_tipo     (tipo),
  KEY idx_ocorrencia_unidade  (unidade),
  KEY idx_ocorrencia_data     (data_ocorrencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;