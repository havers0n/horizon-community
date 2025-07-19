import User from '../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin', 'supervisor']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.create({ data: { name: req.body.name, owner: user.id, status: 3, access: { groups: [...process.env.ADMIN_ACCESS.split(',').map(Number), ...process.env.SUPERVISOR_ACCESS.split(',').map(Number)], type: 1}, time: Number(req.body.time) } })
    return res.status(200).json(test);
}