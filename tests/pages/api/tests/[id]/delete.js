import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id) } });
    if(!test || (test.owner != user.id && !user.permissions.includes('admin'))) return res.status(404).json({});
    test = await prisma.ts_tests.delete({ where: { id: test.id } })
    return res.status(200).json({});
}