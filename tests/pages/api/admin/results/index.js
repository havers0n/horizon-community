import User from '../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin', 'supervisor']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let results = await prisma.ts_results.findMany({ where: { NOT: [{ status: 0 }, { status: 1 }] }, orderBy: { id: 'desc' } });
    let users = await prisma.core_members.findMany({ })
    results.map(e => {
        e.name = users.find(d => d.member_id == e.user).name
    })
    return res.status(200).json(results)
}