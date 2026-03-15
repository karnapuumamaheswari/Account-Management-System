import { Router } from 'express'
import { listUsers } from '../controllers/userController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(protect)
router.get('/', listUsers)

export default router
