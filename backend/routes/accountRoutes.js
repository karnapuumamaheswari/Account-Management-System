import { Router } from 'express'
import {
  getBalance,
  getStatement,
  transferMoney,
} from '../controllers/accountController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(protect)
router.get('/balance', getBalance)
router.get('/statement', getStatement)
router.post('/transfer', transferMoney)

export default router
