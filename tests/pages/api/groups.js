import User from './utils/access'
import { PrismaClient } from "@prisma/client";
import axios from "axios";
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    axios.get(`${process.env.NEXT_PUBLIC_FORUM_URL}/api/core/groups`, {
        auth: {
            username: process.env.FORUM_API_KEY,
        }
    }).then(({data}) => {
        return res.status(200).json(data.results);
    })
}