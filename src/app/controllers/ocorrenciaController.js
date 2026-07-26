import ocorrenciaRepository from '../repositories/ocorrenciaRepository.js'
import { enviarEmailOcorrencia } from '../../emailService.js'

class OcorrenciaController {

    async index(req, res) {
        try {
            const row = await ocorrenciaRepository.findAll()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async show(req, res) {
        try {
            const id = req.params.id
            const row = await ocorrenciaRepository.findById(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async byTipo(req, res) {
        try {
            const tipo = req.params.tipo
            const row = await ocorrenciaRepository.findByTipo(tipo)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async store(req, res) {
        try {
            const oc = req.body

            if (!oc.tipo)
                return res.status(400).json({ erro: 'Tipo de ocorrência é obrigatório.' })
            if (!oc.nome_colaborador)
                return res.status(400).json({ erro: 'Nome do colaborador é obrigatório.' })
            if (!oc.data_ocorrencia)
                return res.status(400).json({ erro: 'Data da ocorrência é obrigatória.' })
            if (!oc.descricao)
                return res.status(400).json({ erro: 'Descrição é obrigatória.' })

            const row = await ocorrenciaRepository.create(oc)
            res.status(201).json(row)

            // Dispara email em background (não bloqueia a resposta)
            enviarEmailOcorrencia(oc).catch(err => {
                console.error('Erro ao disparar email de ocorrência:', err.message)
            })
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id
            const oc = req.body
            const row = await ocorrenciaRepository.update(oc, id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id
            const row = await ocorrenciaRepository.delete(id)
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async piramide(req, res) {
        try {
            const row = await ocorrenciaRepository.countByTipo()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }

    async mensal(req, res) {
        try {
            const row = await ocorrenciaRepository.countByTipoMes()
            res.json(row)
        } catch (error) {
            res.status(500).json({ erro: error.message })
        }
    }
}

export default new OcorrenciaController()