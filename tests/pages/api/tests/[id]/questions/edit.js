import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let question = await prisma.ts_questions.findFirst({ where: { id: req.body.questionId } })
    if(!question) return;
    let test = await prisma.ts_tests.findFirst({ where: { id: question.testId } })
    if(!test) return;
    if(!user.permissions.includes('admin') && test.owner != user.id) return res.status(403).json({ })
    req.body.type = Number(req.body.type); delete req.body.questionId;
    question = await prisma.ts_questions.update({ where: { id: question.id }, data: {...req.body } })
    return res.status(200).json(question);
}