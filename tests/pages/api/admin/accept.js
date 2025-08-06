import User from '../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin', 'supervisor']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: Number(req.query.id), status: 0 } });
    if(!result) return res.status(404).json({ error: 'Результат не найден' })
    await prisma.ts_results.update({ where: { id: result.id }, data: { status: 1 } })
    return res.status(200).json({ result: 'Прохождение одобрено' })
}