import acidenteRepository from '../repositories/acidenteRepository.js'

class acidenteController {

    async index(req, res) {
        try {
            const row = await acidenteRepository.findAll()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async show(req, res) {
        try {
            const unidade = req.params.unidade
            const row = await acidenteRepository.findByUnidade(unidade)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async update(req, res) {
        try {
            const unidade = req.params.unidade
            const dados = req.body
            const row = await acidenteRepository.upsert(unidade, dados)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }
}

export default new acidenteController()