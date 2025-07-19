import User from '../../../utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import moment from 'moment'
import {EmbedBuilder, ActionRowBuilder, ButtonBuilder} from "discord.js";
import Discord from "../../../utils/discord";
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let test = await prisma.ts_tests.findFirst({ where: { id: Number(req.query.id) } })
    if(!test) return res.status(404).json({})
    // Проверка прав
    let i = 0;
    test.access.groups.map(g => {
        if(user.roles.includes(g)) i++;
    })
    if(i == 0) return res.status(403).json({ error: 'forbidden' })
    let result = await prisma.ts_results.findFirst({ where: { testId: test.id, NOT: [{ status: 5 }], user: user.id } })
    if(result) return res.status(403).json({ error: 'forbidden' })
    let questions = await prisma.ts_questions.findMany({ where: { testId: test.id, status: 1 } })
    questions.map(q => {
        q.count = q.correct.length;
        delete q.correct;
    })
    result = await prisma.ts_results.create({ data: { testId: test.id, testInfo: test, status: test.access.type == 0 ? 0 : 1, answers: shuffle(questions), user: user.id, start: moment().unix(), end: moment().add(test.time, 'seconds').unix(), lastKA: moment().unix() } })
    if(test.access.type == 0) {
        const response = new EmbedBuilder()
            .setDescription('Запрос на прохождение тестирования (ручной доступ)')
            .addFields(
                { name: 'Пользователь', value: user.name },
                { name: 'Тестирование', value: test.name }
            )
            .setColor('#F56565')
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(`${process.env.NEXT_PUBLIC_URL}/api/admin/accept?id=${result.id}`)
                    .setLabel("Одобрить")
                    .setStyle("5"),
                new ButtonBuilder()
                    .setURL(`${process.env.NEXT_PUBLIC_URL}/api/admin/decline?id=${result.id}`)
                    .setLabel("Отклонить")
                    .setStyle("5"),
            );
        await Discord(process.env.DISCORD_CHANNEL_ACCEPTS, { embeds: [response], components: [buttons] })
    }
    return res.status(200).json(result);
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}