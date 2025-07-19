import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin', 'supervisor']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: Number(req.query.id), NOT: [{ status: 0 }, { status: 1 }] } });
    result.name = await prisma.core_members.findFirst({ where: { member_id: result.user } });
    result.name = result.name.name;
    let questions = await prisma.ts_questions.findMany({ where: { testId: result.testId } });
    return res.status(200).json({ questions: questions, result: result })
}