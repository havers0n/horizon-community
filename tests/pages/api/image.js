import User from './utils/access'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import fs from "fs";
const formidable = require('formidable');
import { v4 } from 'uuid'
import { validateImage } from "image-validator";
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if(!files.image) return res.status(400).json()
        files.image.type = files.image.mimetype.split('/')[1] == 'jpeg' ? 'jpg' : 'png';
        if(files.image.type != 'png' && files.image.type != 'jpg') return res.status(400).json({})
        let name = `${v4()}.${files.image.type}`
        const data = fs.readFileSync(files.image.filepath);
        fs.writeFileSync(`${process.env.ROOT_DIR || process.cwd()}/public/uploads/${name}`, data);
        await fs.unlinkSync(files.image.filepath);
        return res.status(200).json({ url: name })
    });
}

export const config = {
    api: {
        bodyParser: false,
    },
}