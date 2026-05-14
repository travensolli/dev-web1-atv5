const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const pool = require("../database/db");

const projectRoot = path.resolve(__dirname, "..", "..");
const sqlDir = path.resolve(__dirname, "init");
const seedDataDir = path.resolve(sqlDir, "seed-data");

// A ordem importa: esse array define a sequência exata de execução dos scripts.
const sqlFiles = [
    "schema-sql.sql",
    "seed-sql.sql"
];

async function runSqlFiles() {
    const files = sqlFiles.map((fileName) => path.join(sqlDir, fileName));
    if (files.length === 0) {
        throw new Error(`Nenhum arquivo .sql encontrado em ${sqlDir}`);
    }
    try {
        for (const file of files) {
            const relativeFile = path.relative(projectRoot, file).replaceAll(path.sep, "/");
            process.stdout.write(`Executando ${relativeFile}... `);

            const isSeed = path.basename(file) === "seed-sql.sql";
            if (isSeed) {
                await runSeedViaCopyStdin();
            } else {
                let sql = await fsp.readFile(file, "utf8");
                await pool.query(sql);
            }
            console.log("ok");
        }
    } finally {
        await pool.end();
    }
    console.log(`${files.length} arquivo(s) SQL executado(s).`);
}

/**
 * Executa o seed usando COPY ... FROM STDIN para enviar o CSV
 * da máquina local ao servidor remoto (funciona com Render e qualquer host).
 */
async function runSeedViaCopyStdin() {
    const csvPath = path.join(seedDataDir, "megasena.csv");

    // Lê o SQL do seed e extrai os parâmetros do COPY para montar o FROM STDIN
    const client = await pool.connect();
    try {
        // Garante que o servidor interprete datas no formato DD/MM/YYYY do CSV
        await client.query("SET DateStyle = 'ISO, DMY';");
        // Primeiro, trunca a tabela
        await client.query("TRUNCATE TABLE megasena;");

        // Usa COPY FROM STDIN — o cliente envia o arquivo, não o servidor lê
        await new Promise((resolve, reject) => {
            const stream = client.query(
                require("pg-copy-streams").from(
                    "COPY megasena FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ';', NULL 'NULL', ENCODING 'UTF8')"
                )
            );
            const fileStream = fs.createReadStream(csvPath);
            fileStream.on("error", reject);
            stream.on("error", reject);
            stream.on("finish", resolve);
            fileStream.pipe(stream);
        });
    } finally {
        client.release();
    }
}

runSqlFiles().catch((error) => {
    console.error("Erro ao executar arquivos SQL:");
    console.error(error.message);
    process.exitCode = 1;
});