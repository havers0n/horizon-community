import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    if(!req.body.type || !req.body.groups) return res.status(400).json({})
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id) } });
    if(!test) return res.status(404).json({});
    if(!user.permissions.includes('admin') && test.owner != user.id) return res.status(403).json({ })
    test = await prisma.ts_tests.update({ where: { id: test.id }, data: { access: req.body } })
    return res.status(200).json(test);
}