import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
import moment from 'moment'
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let group = await prisma.ts_groups.create({ data: { name: req.body.name, status: 1, createdBy: user.id, createdAt: moment().toISOString() } })
    return res.status(200).json(group);
}