import User from '../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let tests = await prisma.ts_tests.findMany({ })
    let users = await prisma.core_members.findMany({})
    console.log(user.permissions)
    if(!user.permissions.includes('admin')) tests = tests.filter(e => e.owner == user.id)
    tests = tests.filter(e => e.status == 3 && e.owner == user.id || e.status != 3);
    if(user.permissions.includes('admin')) {
        tests.map(t => {
            t.ownerName = users.find(e => e.member_id == t.owner).name;
        })
    }
    return res.status(200).json(tests);
}