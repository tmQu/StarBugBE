import { Router } from "express";
import FeeService from "../service/fee.js";


const router = Router()


router.post('/get-fee', async (req, res) => {
    try {
        const feeService = new FeeService()
        const result = await feeService.getFee(req)
        res.status(200).json(result)
    } catch (error) {

        res.status(500).json({message: error.message})
    }
})

export default router;