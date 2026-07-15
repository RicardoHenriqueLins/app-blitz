import { Router } from 'express'
import blitizController from './app/controllers/blitizController.js'
import AlertaController from './app/controllers/alertaController.js'
import AcidenteController from './app/controllers/acidenteController.js'
import UnidadeController from './app/controllers/unidadeController.js'
import OcorrenciaController from './app/controllers/ocorrenciaController.js'

const router = Router()

router.get('/blitiz', blitizController.index)
router.get('/blitiz/:id', blitizController.show)
router.post('/blitiz', blitizController.store)
router.put('/blitiz/:id', blitizController.update)
router.delete('/blitiz/:id', blitizController.delete)

router.get('/alerta', AlertaController.index)
router.get('/alerta/:id', AlertaController.show)
router.post('/alerta', AlertaController.store)
router.put('/alerta/:id', AlertaController.update)
router.delete('/alerta/:id', AlertaController.delete)

router.get('/acidente', AcidenteController.index)
router.get('/acidente/:unidade', AcidenteController.show)
router.put('/acidente/:unidade', AcidenteController.update)

router.get('/unidade', UnidadeController.index)
router.get('/unidade/:id', UnidadeController.show)
router.post('/unidade', UnidadeController.store)
router.put('/unidade/:id', UnidadeController.update)
router.delete('/unidade/:id', UnidadeController.delete)

router.get('/ocorrencia', OcorrenciaController.index)
router.get('/ocorrencia/piramide', OcorrenciaController.piramide)
router.get('/ocorrencia/mensal', OcorrenciaController.mensal)
router.get('/ocorrencia/tipo/:tipo', OcorrenciaController.byTipo)
router.get('/ocorrencia/:id', OcorrenciaController.show)
router.post('/ocorrencia', OcorrenciaController.store)
router.put('/ocorrencia/:id', OcorrenciaController.update)
router.delete('/ocorrencia/:id', OcorrenciaController.delete)

export default router