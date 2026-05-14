const { Router } = require("express");
const { getConcurso, last } = require("../repositories/senas.repository");

const routes = Router();

routes.get("/", last);

routes.get("/:concurso", getConcurso);

module.exports = routes;