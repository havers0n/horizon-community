import User from './utils/access'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
export default async function handler(req, res) {
    let user = await User(req);
    if(!user) return res.status(403).json({ error: 'unauthorized' });
    let response = new Object();
    response.results = await prisma.ts_results.findMany({ where: { user: user.id, OR: [{ status: 0 }, { status: 1 }, { status: 2 }, { status: 3 }, { status: 4 }, { status: 5 }] }, orderBy: { id: 'desc' } })
    let tests = await prisma.ts_tests.findMany({ where: { status: 1 } })
    response.tests = tests.filter(e => !response.results.find(d => d.testId == e.id && d.status != 5 && d.user == user.id));
    response.tests.map((test, index) => {
        let i = 0;
        test.access.groups?.map(g => {
            if(user.roles.includes(g)) i++;
        });
        if(i == 0 || !test.access.type) response.tests = response.tests.filter(e => e.id != test.id)
    })
    response.results = response.results.filter(e => e.status != 0 && e.status != 1)
    return res.status(200).json(response);
}