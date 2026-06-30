import { Router } from 'express'
import blitizController from './app/controllers/blitizController.js'
import AlertaController from './app/controllers/alertaController.js'
import AcidenteController from './app/controllers/acidenteController.js'

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

export default router