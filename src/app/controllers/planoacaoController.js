import planoAcaoRepository from "../repositories/planoacaoRepository.js"

class PlanoAcaoController {

    // GET /plano-acao → lista todos os planos (com dados do alerta)
    async index(req, res) {
        try {
            const planos = await planoAcaoRepository.listar()
            return res.json(planos)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao listar planos", detalhes: err.message })
        }
    }

    // GET /plano-acao/:id → busca um plano
    async show(req, res) {
        try {
            const plano = await planoAcaoRepository.buscarPorId(req.params.id)
            return res.json(plano[0] || null)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao buscar plano", detalhes: err.message })
        }
    }

    // GET /plano-acao/alerta/:alertaId → planos de um alerta
    async showByAlerta(req, res) {
        try {
            const planos = await planoAcaoRepository.buscarPorAlerta(req.params.alertaId)
            return res.json(planos)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao buscar planos do alerta", detalhes: err.message })
        }
    }

    // POST /plano-acao → cria um plano
    async store(req, res) {
        try {
            const dados = req.body
            if (!dados.data_criacao) {
                dados.data_criacao = new Date().toISOString().slice(0, 10)
            }
            const resultado = await planoAcaoRepository.criar(dados)
            return res.status(201).json(resultado)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao criar plano", detalhes: err.message })
        }
    }

    // PUT /plano-acao/:id → atualiza um plano
    async update(req, res) {
        try {
            const resultado = await planoAcaoRepository.atualizar(req.params.id, req.body)
            return res.json(resultado)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao atualizar plano", detalhes: err.message })
        }
    }

    // DELETE /plano-acao/:id → exclui um plano
    async delete(req, res) {
        try {
            const resultado = await planoAcaoRepository.deletar(req.params.id)
            return res.json(resultado)
        } catch (err) {
            return res.status(500).json({ erro: "Erro ao excluir plano", detalhes: err.message })
        }
    }
}

export default new PlanoAcaoController()
