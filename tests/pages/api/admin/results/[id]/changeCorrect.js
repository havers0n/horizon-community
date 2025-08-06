import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req, ['admin', 'supervisor']);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: Number(req.query.id), NOT: [{ status: 0 }, { status: 1 }] } });
    let answer = result.answers.find(e => e.id == req.body.question);
    if(!answer) return res.status(403).json({})
    let status = answer.correct == 0 ? 1 : 0
    result.answers[result.answers.findIndex(e => e.id == req.body.question)].correct = status;
    await prisma.ts_results.update({ where: { id: result.id }, data: { answers: [...result.answers] } })
    return res.status(200).json({ status: status })
}