import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { demoUsers } from '../../../lib/demo-users'

function normalizeGoalSheet(sheet: any) {
  return {
    id: sheet.id,
    employeeId: sheet.employeeId,
    employeeName: sheet.employeeName,
    department: sheet.department,
    status: sheet.status,
    submittedAt: sheet.submittedAt,
    approvedAt: sheet.approvedAt,
    goals: (sheet.goals || []).map((goal: any) => ({
      ...goal,
      checkIns: goal.checkIns || [],
    })),
  }
}

async function upsertGoalSheet(snapshot: any) {
  const employee = demoUsers.find((user) => user.id === snapshot.employeeId)
  const userRecord = await prisma.user.upsert({
    where: { email: employee?.email ?? `${snapshot.employeeId}@atomberg.local` },
    update: {
      name: snapshot.employeeName,
      department: snapshot.department,
    },
    create: {
      id: snapshot.employeeId,
      email: employee?.email ?? `${snapshot.employeeId}@atomberg.local`,
      name: snapshot.employeeName,
      role: employee?.role ?? 'EMPLOYEE',
      department: snapshot.department,
      reportingManagerId: employee?.reportingManagerId ?? null,
    },
  })

  const cycleYear = new Date().getFullYear()

  await prisma.goalSheet.upsert({
    where: {
      employeeId_cycleYear: {
        employeeId: userRecord.id,
        cycleYear,
      },
    },
    update: {
      status: snapshot.status,
      submittedAt: snapshot.submittedAt ? new Date(snapshot.submittedAt) : null,
      approvedAt: snapshot.approvedAt ? new Date(snapshot.approvedAt) : null,
      managerId: snapshot.managerId ?? null,
      goals: {
        deleteMany: {},
        create: (snapshot.goals || []).map((goal: any) => ({
          id: goal.id,
          thrustArea: goal.thrustArea,
          title: goal.title,
          description: goal.description,
          uom: goal.uom,
          target: goal.target ?? null,
          weightage: goal.weightage,
          actualAchievement: goal.actualAchievement ?? null,
          progressScore: goal.progressScore ?? null,
          status: goal.status,
          sharedGoalId: goal.sharedGoalGroupId ?? goal.sharedGoalId ?? null,
          isSharedGoal: Boolean(goal.isSharedGoal),
          checkIns: {
            deleteMany: {},
            create: (goal.checkIns || []).map((checkIn: any) => ({
              userId: snapshot.employeeId,
              quarter: checkIn.quarter,
              actualAchievement: checkIn.actualAchievement ?? null,
              managerComment: checkIn.managerComment ?? null,
            })),
          },
        })),
      },
    },
    create: {
      employeeId: userRecord.id,
      cycleYear,
      status: snapshot.status,
      submittedAt: snapshot.submittedAt ? new Date(snapshot.submittedAt) : null,
      approvedAt: snapshot.approvedAt ? new Date(snapshot.approvedAt) : null,
      managerId: snapshot.managerId ?? null,
      goals: {
        create: (snapshot.goals || []).map((goal: any) => ({
          id: goal.id,
          thrustArea: goal.thrustArea,
          title: goal.title,
          description: goal.description,
          uom: goal.uom,
          target: goal.target ?? null,
          weightage: goal.weightage,
          actualAchievement: goal.actualAchievement ?? null,
          progressScore: goal.progressScore ?? null,
          status: goal.status,
          sharedGoalId: goal.sharedGoalGroupId ?? goal.sharedGoalId ?? null,
          isSharedGoal: Boolean(goal.isSharedGoal),
          checkIns: {
            create: (goal.checkIns || []).map((checkIn: any) => ({
              userId: snapshot.employeeId,
              quarter: checkIn.quarter,
              actualAchievement: checkIn.actualAchievement ?? null,
              managerComment: checkIn.managerComment ?? null,
            })),
          },
        })),
      },
    },
  })
}

export async function GET() {
  const goalSheets = await prisma.goalSheet.findMany({
    include: {
      employee: true,
      goals: {
        include: {
          checkIns: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({
    goalSheets: goalSheets.map((sheet: any) => normalizeGoalSheet({
      ...sheet,
      employeeName: sheet.employee.name,
      department: sheet.employee.department,
    })),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  await upsertGoalSheet(body)
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const snapshots = Array.isArray(body.goalSheets) ? body.goalSheets : []

  for (const snapshot of snapshots) {
    await upsertGoalSheet(snapshot)
  }

  return NextResponse.json({ ok: true })
}
