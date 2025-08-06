import { PrismaClient } from "@prisma/client";
import axios from 'axios'
const prisma = new PrismaClient()

export default async function handler(req, access = []) {
    console.log(req.cookies.ips4_device_key)
    if(!req.cookies.ips4_device_key) return false;
    console.log(req.cookies.ips4_device_key)
    let device = await prisma.core_members_known_devices.findFirst({ where: { device_key: req.cookies.ips4_device_key } })
    console.log(device);
    if(!device) return false;
    let response = await axios.get(`${process.env.NEXT_PUBLIC_FORUM_URL}/api/index.php?/core/members/${device.member_id}`, {
        auth: {
            username: process.env.FORUM_API_KEY,
        }
    }).catch(err => { console.log(err); return false; })
    console.log(response)
    let user = response.data;
    if(!user) return false;
    if (user.primaryGroup.id == 3) return false;
    user.roles = [user.primaryGroup.id, ...user.secondaryGroups];
    user.permissions = [];
    process.env.ADMIN_ACCESS.split(',').map(r => {
        let group = user.roles.find(e => e == r);
        if(!user.permissions.includes('admin') && group) user.permissions.push('admin')
    })
    process.env.SUPERVISOR_ACCESS.split(',').map(r => {
        let group = user.roles.find(e => e == r);
        if(!user.permissions.includes('supervisor') && group) user.permissions.push('supervisor')
    })
    access.map(ac => {
        if(!user.permissions.includes(ac)) return false;
    })
    return user;
}
