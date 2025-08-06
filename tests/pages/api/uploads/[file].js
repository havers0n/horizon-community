import fs from 'fs'
export default async function handler(req, res) {
    const data = fs.readFileSync(`${process.env.ROOT_DIR || process.cwd()}/public/uploads/${req.query.file}`);
    res.setHeader('Content-Type', 'image/jpg')
    res.send(data)
}