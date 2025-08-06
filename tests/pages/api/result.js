import User from './utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: Number(req.query.id), user: user.id, NOT: [{ status: 0 }, { status: 1 }, { status: 2 }] } });
    if(!result) return res.status(400).json({ error: 'result_not_found' })
    let questions = await prisma.ts_questions.findMany({ where: { testId: result.testId } });
    return res.status(200).json({ questions: questions, result: result })
}