import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { demoUsers } from '../../../lib/demo-users'

function mapAuditLog(log: any) {
  return {
    id: log.id,
    timestamp: log.createdAt,
    action: log.action,
    actorName: log.user?.name ?? 'System',
    actorRole: log.user?.role ?? 'ADMIN',
    details: log.changes ?? '',
  }
}

export async function GET() {
  const auditLogs = await prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 500,
  })

  return NextResponse.json({
    auditLogs: auditLogs.map(mapAuditLog),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = demoUsers.find((entry) => entry.name === body.actorName) ?? demoUsers[4]

  await prisma.auditLog.create({
    data: {
      action: body.action,
      changes: body.details,
      userId: user.id,
    },
  })

  return NextResponse.json({ ok: true })
}
