import alertaRepository from '../repositories/alertaRepository.js'
import { enviarEmailAlerta } from '../../emailService.js'

class AlertaController {
    async index(req, res) {
        try {
            const alertas = await alertaRepository.findAll()

            res.json(alertas)
        } catch (e) {
            res.status(500).json({
                erro: e.message
            })
        }
    }

    async show(req, res) {
        try {
            const alerta = await alertaRepository.findById(req.params.id)

            res.json(alerta)
        } catch (e) {
            res.status(500).json({
                erro: e.message
            })
        }
    }

    async store(req, res) {
        try {
            const row = await alertaRepository.create(req.body)

            res.status(201).json(row)

            enviarEmailAlerta(req.body)
                .catch(err => {
                    console.error('Erro ao enviar email:', err.message)
                })
        } catch (e) {
            res.status(500).json({
                erro: e.message
            })
        }
    }

    async update(req, res) {
        try {
            const alerta = await alertaRepository.update(
                req.body,
                req.params.id
            )

            res.json(alerta)
        } catch (e) {
            res.status(500).json({
                erro: e.message
            })
        }
    }

    async delete(req, res) {
        try {
            const alerta = await alertaRepository.delete(req.params.id)

            res.json(alerta)
        } catch (e) {
            res.status(500).json({
                erro: e.message
            })
        }
    }
}

export default new AlertaController()