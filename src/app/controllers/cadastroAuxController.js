import repo from '../repositories/cadastroAuxRepository.js'

class CadastroAuxController {

    async listar(req, res) {
        try {
            const tipo = req.params.tipo
            res.json(await repo.findByTipo(tipo))
        } catch (e) { res.status(500).json({ erro: e.message }) }
    }

    async criar(req, res) {
        try {
            const tipo = req.params.tipo
            const { nome } = req.body
            if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' })
            res.status(201).json(await repo.create({ tipo, nome: nome.trim().toUpperCase() }))
        } catch (e) { res.status(500).json({ erro: e.message }) }
    }

    async atualizar(req, res) {
        try {
            const { nome } = req.body
            if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' })
            res.json(await repo.update({ nome: nome.trim().toUpperCase() }, req.params.id))
        } catch (e) { res.status(500).json({ erro: e.message }) }
    }

    async deletar(req, res) {
        try { res.json(await repo.delete(req.params.id)) }
        catch (e) { res.status(500).json({ erro: e.message }) }
    }
}

export default new CadastroAuxController()