import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let groups = await prisma.ts_groups.findMany({ where: { status: 1 } })
    return res.status(200).json(groups);
}