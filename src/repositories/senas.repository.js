const pool = require("../database/db");

async function last(_req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM megasena ORDER BY concurso DESC LIMIT 1",
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Nenhum concurso encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}

async function getConcurso(req, res) {
    const { concurso } = req.params;

    if (/^\d+$/.test(concurso) == false) {
        return res.status(400).json({ message: "Concurso deve ser um número inteiro" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM megasena WHERE concurso = $1",
            [concurso],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Nenhum concurso encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Erro interno do servidor" });
    }
}

module.exports = {
    last,
    getConcurso
};