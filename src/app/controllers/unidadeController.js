import unidadeRepository from '../repositories/unidadeRepository.js'

function capitalizar(str) {
    return str.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase())
}

class UnidadeController {

    async index(req, res) {
        try {
            const row = await unidadeRepository.findAll()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async show(req, res) {
        try {
            const id = req.params.id
            const row = await unidadeRepository.findById(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async store(req, res) {
        try {
            const { nome, cidade, uf } = req.body

            if (!nome || !nome.trim())
                return res.status(400).json({ erro: 'Nome da unidade é obrigatório.' })
            if (!cidade || !cidade.trim())
                return res.status(400).json({ erro: 'Cidade é obrigatória.' })
            if (!uf || uf.trim().length !== 2)
                return res.status(400).json({ erro: 'UF inválida.' })

            const unidade = {
                nome: nome.trim().toUpperCase(),
                cidade: capitalizar(cidade.trim()),
                uf: uf.trim().toUpperCase()
            }

            // Verifica se já existe (ativa ou inativa)
            const existente = await unidadeRepository.findByNome(unidade.nome)

            if (existente && existente.length > 0) {
                const reg = existente[0]

                if (reg.ativo === 1) {
                    // Já existe e está ativa
                    return res.status(409).json({ erro: 'Unidade já cadastrada.' })
                }

                // Existe mas está inativa → reativar
                await unidadeRepository.reactivate(reg.id, unidade)
                return res.status(201).json({ id: reg.id, ...unidade })
            }

            // Não existe → inserir
            const row = await unidadeRepository.create(unidade)
            res.status(201).json(row)
        } catch (error) {
            if (error.message && error.message.includes('Duplicate'))
                return res.status(409).json({ erro: 'Unidade já cadastrada.' })
            res.status(500).json({ erro: error.message })
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id
            const { nome, cidade, uf } = req.body

            if (!nome || !nome.trim())
                return res.status(400).json({ erro: 'Nome é obrigatório.' })

            const unidade = {
                nome: nome.trim().toUpperCase(),
                cidade: capitalizar(cidade.trim()),
                uf: uf.trim().toUpperCase()
            }

            const row = await unidadeRepository.update(unidade, id)
            res.json(row)
        } catch (error) {
            if (error.message && error.message.includes('Duplicate'))
                return res.status(409).json({ erro: 'Já existe unidade com esse nome.' })
            res.status(500).json({ erro: error.message })
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id
            const row = await unidadeRepository.delete(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }
}

export default new UnidadeController()