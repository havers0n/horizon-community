import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
const formidable = require('formidable');
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id) }, include: { questions: true } })
    if(!test) return res.status(404).json({})
    if(!user.permissions.includes('admin') && test.owner != user.id) return res.status(403).json({ })
    let question = await prisma.ts_questions.create({ data: { question: req.body.name, type: Number(req.body.type), answers: req.body.answers || [], status: 1, testId: test.id, correct: req.body.correct || [], image: req.body.image || null } })
    return res.status(200).json(question);
}