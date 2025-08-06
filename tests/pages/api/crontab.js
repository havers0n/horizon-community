import User from './utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import moment from 'moment'
import Discord from './utils/discord'
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
export default async function handler(req, res) {
    let results = await prisma.ts_results.findMany({ where: { status: 1 } })
    if(!results) return res.status(404).json({ error: 'result not found' });
    let users = await prisma.core_members.findMany({ })
    results.map(async(result) => {
        let user = users.find(e => e.member_id == result.user)
        if(moment().diff(moment.unix(result.lastKA), 'minutes') >= 1) {
            const response = new EmbedBuilder()
                .setDescription('Тестирование завершено (нет признаков жизни)')
                .addFields(
                    { name: 'Пользователь', value: user.name },
                    { name: 'Номер результата', value: `#${result.id}` }
                )
                .setColor('#F56565')
            await Discord(process.env.DISCORD_CHANNEL_LOGS, { embeds: [response] })
            await prisma.ts_results.update({ where: { id: result.id }, data: { status: 2, answers: [] } })
        }
    })
    return res.status(200).json({});
}