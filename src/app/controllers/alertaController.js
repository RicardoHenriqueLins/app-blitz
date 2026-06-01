import alertaRepository from '../repositories/alertaRepository.js'

class AlertaController {

    async index(req, res) {
        try {
            const row = await alertaRepository.findAll()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async show(req, res) {
        try {
            const id = req.params.id
            const row = await alertaRepository.findByid(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async store(req, res) {
        try {
            const alerta = req.body
            const row = await alertaRepository.create(alerta)
            res.status(201).json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id
            const alerta = req.body
            const row = await alertaRepository.update(alerta, id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id
            const row = await alertaRepository.delete(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }
}

export default new AlertaController()