import blitizRepository from '../repositories/blitizRepository.js'

class BlitizController {

    async index(req, res) {
        try {
            const row = await blitizRepository.findAll()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async show(req, res) {
        try {
            const id = req.params.id
            const row = await blitizRepository.findByid(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async store(req, res) {
        try {
            const blitiz = req.body
            const row = await blitizRepository.create(blitiz)
            res.status(201).json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id
            const blitiz = req.body
            const row = await blitizRepository.update(blitiz, id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id
            const row = await blitizRepository.delete(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }
}

export default new BlitizController()
