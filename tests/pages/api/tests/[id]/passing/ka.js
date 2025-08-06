import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import moment from 'moment'
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: req.body.result, user: user.id, OR: [{ status: 0 }, {status: 1}] } })
    if(!result) return res.status(200).json({ error: 'result not found' })
    result = await prisma.ts_results.update({ where: { id: result.id }, data: { lastKA: moment().unix() } })
    return res.status(200).json(result);
}