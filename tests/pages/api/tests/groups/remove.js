import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let group = await prisma.ts_groups.findFirst({ where: { id: Number(req.body.id) } });
    if(!group) return res.status(404).json({});
    await prisma.ts_groups.update({ where: { id: group.id }, data: { status: 0 } });
    await prisma.ts_tests.updateMany({ where: { group: group.id }, data: { group: null } })
    return res.status(200).json({});
}