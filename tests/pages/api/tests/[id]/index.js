import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id) }, include: { questions: true } })
    if(!test) return res.status(404).json({})
    else if(!user.permissions.includes('admin') && test.owner != user.id) return res.status(404).json({})
    test.questions = test.questions.filter(e => e.status == 1)
    return res.status(200).json(test);
}