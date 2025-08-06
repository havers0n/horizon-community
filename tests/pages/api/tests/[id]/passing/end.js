import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import moment from 'moment'
import {EmbedBuilder} from "discord.js";
import Discord from "../../../utils/discord";
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let result = await prisma.ts_results.findFirst({ where: { id: req.body.result, user: user.id, status: 1 } })
    if(!result) return res.status(404).json({ error: 'result not found' })
    let test = await prisma.ts_tests.findFirst({ where: { id: result.testId } });
    let questions = await prisma.ts_questions.findMany({ where: { testId: test.id } });
    let answers = [];
    if(req.body.answers.length != result.answers.length) {
        req.body.answers.length = result.answers.length
    }
    result.answers.map((an, index) => {
        let question = questions.find(e => e.id == an.id);
        let answer = req.body.answers[index];
        answers.push({
            id: question.id,
            answer: answer,
            type: question.type,
            correctAnswer: question.correct,
            correct: question.type == 0 ? question.correct.length < 2 ? question.correct[0] != answer ? 0 : 1 : arraysEqual(answer, question.correct) ? 1 : 0 : 0
        })
    })
    result = await prisma.ts_results.update({ where: { id: result.id }, data: { status: 2, answers: answers } })
    const response = new EmbedBuilder()
        .setDescription('Тестирование завершено')
        .addFields(
            { name: 'Пользователь', value: user.name },
            { name: 'Номер результата', value: `#${result.id}` },
            { name: 'Время прохождения', value: `${moment().diff(moment.unix(result.start), 'minutes')} мин.` },
            { name: 'Тестирование', value: test.name },
        )
        .setColor('#48BB78');
    if(result.answers.filter(e => e.type == 0).length > 0) response.addFields({ name: 'Количество правильных ответов (теория)', value: `${result.answers.filter(e => e.type == 0 && e.correct == 1).length}/${result.answers.filter(e => e.type == 0).length}, ${Math.round(result.answers.filter(e => e.type == 0 && e.correct == 1).length/result.answers.filter(e => e.type == 0).length*100)}%` })
    await Discord(process.env.DISCORD_CHANNEL_LOGS, { embeds: [response] })
    await prisma.ts_results.update({ where: { id: result.id }, data: { status: 2 } })
    return res.status(200).json(result);
}

function arraysEqual(a, b) {
    for (var i = 0; i < a.length; ++i) {
        if(!b.includes(a[i])) return false;
    }
    for (var i = 0; i < b.length; ++i) {
        if(!a.includes(b[i])) return false;
    }
    return true;
}