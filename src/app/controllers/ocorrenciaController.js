import ocorrenciaRepository from '../repositories/ocorrenciaRepository.js'

class OcorrenciaController {
    async index(req, res) { try { res.json(await ocorrenciaRepository.findAll()) } catch(e) { res.status(500).json({erro:e.message}) } }
    async show(req, res) { try { res.json(await ocorrenciaRepository.findById(req.params.id)) } catch(e) { res.status(500).json({erro:e.message}) } }
    async byTipo(req, res) { try { res.json(await ocorrenciaRepository.findByTipo(req.params.tipo)) } catch(e) { res.status(500).json({erro:e.message}) } }
    async store(req, res) { try { const oc=req.body; if(!oc.tipo) return res.status(400).json({erro:'Tipo obrigatorio'}); if(!oc.nome_colaborador) return res.status(400).json({erro:'Nome obrigatorio'}); if(!oc.data_ocorrencia) return res.status(400).json({erro:'Data obrigatoria'}); if(!oc.descricao) return res.status(400).json({erro:'Descricao obrigatoria'}); res.status(201).json(await ocorrenciaRepository.create(oc)) } catch(e) { res.status(500).json({erro:e.message}) } }
    async update(req, res) { try { res.json(await ocorrenciaRepository.update(req.body, req.params.id)) } catch(e) { res.status(500).json({erro:e.message}) } }
    async delete(req, res) { try { res.json(await ocorrenciaRepository.delete(req.params.id)) } catch(e) { res.status(500).json({erro:e.message}) } }
    async piramide(req, res) { try { res.json(await ocorrenciaRepository.countByTipo()) } catch(e) { res.status(500).json({erro:e.message}) } }
    async mensal(req, res) { try { res.json(await ocorrenciaRepository.countByTipoMes()) } catch(e) { res.status(500).json({erro:e.message}) } }
}

export default new OcorrenciaController()
