#!/usr/bin/env node
// Gera migrations/0006_seed_gabriel.sql a partir de seeds/*.json.
// Uso: node scripts/build-seed.mjs
// Sem dependências: só Node e fs. Chaves que começam com "_" são notas e são ignoradas.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PASTA_SEEDS = join(RAIZ, "seeds");
const SAIDA = join(RAIZ, "migrations", "0006_seed_gabriel.sql");

// Ordem de inserção: tabelas referenciadas por FK vêm antes (trilhas antes de disciplinas).
const ORDEM_TABELAS = [
  "trilhas",
  "ciclos",
  "disciplinas",
  "goals",
  "roadmap_areas",
  "career_steps",
  "career_goals",
  "contributions",
  "soft_skills",
  "events",
];

// Arquivos com formato { "itens": [...] } ou [...] mapeados para a tabela.
// carreira.json tem várias chaves-array (career_steps, career_goals): a tabela é a própria chave.
// profile.json não é tabela: vai para src/data/profile.ts.
const ARQUIVO_PARA_TABELA = {
  "trilhas.json": "trilhas",
  "ciclos.json": "ciclos",
  "disciplinas.json": "disciplinas",
  "metas.json": "goals",
  "roadmap.json": "roadmap_areas",
  "contribuicoes.json": "contributions",
  "soft-skills.json": "soft_skills",
  "eventos.json": "events",
};
const ARQUIVOS_SEM_TABELA = new Set(["profile.json"]);

const IDENTIFICADOR = /^[a-z_][a-z0-9_]*$/;

// Remove recursivamente toda chave que começa com "_".
function limpa(valor) {
  if (Array.isArray(valor)) return valor.map(limpa);
  if (valor !== null && typeof valor === "object") {
    const saida = {};
    for (const [chave, v] of Object.entries(valor)) {
      if (chave.startsWith("_")) continue;
      saida[chave] = limpa(v);
    }
    return saida;
  }
  return valor;
}

// Converte um valor JS em literal SQL. Arrays e objetos viram string JSON.
function sqlValor(valor, contexto) {
  if (valor === null || valor === undefined) return "NULL";
  if (typeof valor === "boolean") return valor ? "1" : "0";
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) throw new Error(`${contexto}: número inválido`);
    return String(valor);
  }
  if (typeof valor === "string") {
    if (valor.includes("\0")) throw new Error(`${contexto}: caractere NUL`);
    return `'${valor.replace(/'/g, "''")}'`;
  }
  if (typeof valor === "object") return sqlValor(JSON.stringify(valor), contexto);
  throw new Error(`${contexto}: tipo não suportado (${typeof valor})`);
}

// Extrai as linhas de cada tabela de um arquivo. Retorna [{ tabela, linhas }].
function extraiTabelas(arquivo, json) {
  if (Array.isArray(json)) {
    return [{ tabela: mapeiaTabela(arquivo), linhas: json }];
  }
  if (Array.isArray(json.itens)) {
    return [{ tabela: mapeiaTabela(arquivo), linhas: json.itens }];
  }
  const tabelas = [];
  for (const [chave, v] of Object.entries(json)) {
    if (chave.startsWith("_") || !Array.isArray(v)) continue;
    tabelas.push({ tabela: chave, linhas: v });
  }
  if (tabelas.length === 0) throw new Error(`${arquivo}: nenhuma lista de linhas encontrada`);
  return tabelas;
}

function mapeiaTabela(arquivo) {
  const tabela = ARQUIVO_PARA_TABELA[arquivo];
  if (!tabela) throw new Error(`${arquivo}: arquivo sem tabela mapeada em build-seed.mjs`);
  return tabela;
}

function gerarInserts(tabela, linhas) {
  if (linhas.length === 0) return [];
  const limpas = linhas.map(limpa);
  const colunas = Object.keys(limpas[0]);
  for (const coluna of colunas) {
    if (!IDENTIFICADOR.test(coluna)) throw new Error(`${tabela}: coluna inválida "${coluna}"`);
  }
  const lista = colunas.join(", ");
  return limpas.map((linha, i) => {
    const chaves = Object.keys(linha);
    const mesmaForma =
      chaves.length === colunas.length && colunas.every((c) => Object.hasOwn(linha, c));
    if (!mesmaForma) {
      throw new Error(`${tabela}: linha ${i + 1} tem chaves diferentes da primeira linha`);
    }
    const valores = colunas.map((c) => sqlValor(linha[c], `${tabela}.${c} (linha ${i + 1})`));
    return `INSERT INTO ${tabela} (${lista}) VALUES (${valores.join(", ")});`;
  });
}

function main() {
  const arquivos = readdirSync(PASTA_SEEDS).filter((f) => f.endsWith(".json")).sort();
  const porTabela = new Map(ORDEM_TABELAS.map((t) => [t, []]));

  for (const arquivo of arquivos) {
    if (ARQUIVOS_SEM_TABELA.has(arquivo)) continue;
    const json = JSON.parse(readFileSync(join(PASTA_SEEDS, arquivo), "utf8"));
    for (const { tabela, linhas } of extraiTabelas(arquivo, json)) {
      if (!porTabela.has(tabela)) throw new Error(`${arquivo}: tabela "${tabela}" fora da ordem`);
      porTabela.get(tabela).push(...linhas.map((linha) => ({ arquivo, linha })));
    }
  }

  const blocos = [
    "-- Seed do PDI Gabriel Jesus. Gerado por scripts/build-seed.mjs a partir de seeds/*.json.",
    "-- Não editar à mão: altere o JSON e rode `node scripts/build-seed.mjs`.",
    "",
  ];
  const contagem = {};

  for (const tabela of ORDEM_TABELAS) {
    const itens = porTabela.get(tabela);
    contagem[tabela] = itens.length;
    blocos.push(`-- ${tabela}: ${itens.length} linha(s)`);
    if (itens.length === 0) {
      blocos.push("");
      continue;
    }
    // Todas as linhas de uma tabela vêm do mesmo arquivo; garante que não misturou.
    const arquivosDaTabela = new Set(itens.map((i) => i.arquivo));
    if (arquivosDaTabela.size !== 1) {
      throw new Error(`${tabela}: linhas vindas de mais de um arquivo (${[...arquivosDaTabela].join(", ")})`);
    }
    blocos.push(...gerarInserts(tabela, itens.map((i) => i.linha)));
    blocos.push("");
  }

  writeFileSync(SAIDA, blocos.join("\n"), "utf8");
  for (const [tabela, n] of Object.entries(contagem)) {
    process.stdout.write(`${tabela.padEnd(16)} ${n}\n`);
  }
  process.stdout.write(`Escrito: ${SAIDA}\n`);
}

main();
