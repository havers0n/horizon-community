import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id), status: 0 } });
    if(!test) return res.status(404).json({});
    test = await prisma.ts_tests.update({ where: { id: test.id }, data: { status: 3 } })
    return res.status(200).json(test);
}