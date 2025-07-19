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
    if(result.warned == 0) {
        await prisma.ts_results.update({ where: { id: result.id }, data: { warned: 1 } })
        return res.status(200).json({ warned: 0 })
    }
    result = await prisma.ts_results.update({ where: { id: result.id }, data: { status: 4, answers: [] } })
    const response = new EmbedBuilder()
        .setDescription('Тестирование завершено (пользователь свернул страницу)')
        .addFields(
            { name: 'Пользователь', value: user.name },
            { name: 'Номер результата', value: `#${result.id}` },
        )
        .setColor('#F56565')
    await Discord(process.env.DISCORD_CHANNEL_LOGS, { embeds: [response] })
    return res.status(200).json({ warned: 1 });
}