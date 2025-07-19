import User from './utils/access'
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    return res.status(200).json(user);
}