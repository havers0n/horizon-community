import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id), owner: user.id, status: 3 } });
    if(!test) return res.status(404).json({});
    test = await prisma.ts_tests.update({ where: { id: test.id }, data: { status: user.permissions.includes('admin') ? 1 : 0 } })
    return res.status(200).json(test);
}