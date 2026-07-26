import gestorRepository from '../repositories/gestorRepository.js'

class GestorController {
    async index(req, res) { try { res.json(await gestorRepository.findAll()) } catch (e) { res.status(500).json({ erro: e.message }) } }
    async show(req, res) { try { res.json(await gestorRepository.findById(req.params.id)) } catch (e) { res.status(500).json({ erro: e.message }) } }
    async store(req, res) {
        try {
            const { nome, email, area, unidade } = req.body
            if (!nome || !email) return res.status(400).json({ erro: 'Nome e email obrigatórios.' })
            res.status(201).json(await gestorRepository.create({ nome, email, area: area || null, unidade: unidade || null }))
        } catch (e) { res.status(500).json({ erro: e.message }) }
    }
    async update(req, res) {
        try {
            const { nome, email, area, unidade } = req.body
            if (!nome || !email) return res.status(400).json({ erro: 'Nome e email obrigatórios.' })
            res.json(await gestorRepository.update({ nome, email, area: area || null, unidade: unidade || null }, req.params.id))
        } catch (e) { res.status(500).json({ erro: e.message }) }
    }
    async delete(req, res) { try { res.json(await gestorRepository.delete(req.params.id)) } catch (e) { res.status(500).json({ erro: e.message }) } }
}

export default new GestorController()