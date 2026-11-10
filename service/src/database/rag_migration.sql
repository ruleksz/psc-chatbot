-- Migration: Skema RAG Dokumen Internal PSC Chatbot
-- Berdasarkan spesifikasi: docs/rag-flow-diagram.md dan docs/rag-technical-design.md

-- 1. Tabel dokumen sumber
CREATE TABLE IF NOT EXISTS `rag_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `source_file` VARCHAR(255) NOT NULL COMMENT 'Nama file asli, misal: psc-chatbot-faq.md',
  `version` VARCHAR(50) DEFAULT '1.0',
  `status` ENUM('active','archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_source_file` (`source_file`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Tabel potongan dokumen (chunks)
CREATE TABLE IF NOT EXISTS `rag_chunks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_id` BIGINT UNSIGNED NOT NULL,
  `chunk_index` INT UNSIGNED NOT NULL COMMENT 'Urutan potongan dalam dokumen',
  `heading` VARCHAR(255) DEFAULT NULL COMMENT 'Heading/bagian asal potongan',
  `heading_parent` VARCHAR(255) DEFAULT NULL COMMENT 'Heading tingkat 2 induk',
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chunk_document` (`document_id`),
  FULLTEXT KEY `ft_chunk_content` (`content`, `heading`),
  CONSTRAINT `fk_chunk_document` FOREIGN KEY (`document_id`)
    REFERENCES `rag_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tambahkan kolom rag_sources pada tabel messages jika belum ada
ALTER TABLE `messages`
  ADD COLUMN IF NOT EXISTS `rag_sources` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL;

