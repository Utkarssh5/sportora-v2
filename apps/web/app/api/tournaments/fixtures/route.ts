import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Tournament, Fixture } from '@/models/Database';
import { authorize } from '@/lib/middleware';

export async function POST(req: Request) {
  const auth = authorize(req, ['organizer', 'admin', 'ORGANIZER', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { tournamentId } = await req.json();
    if (!tournamentId) return NextResponse.json({ error: 'Tournament ID required' }, { status: 400 });

    await connectToDatabase();
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament || tournament.registeredTeams.length < 2) {
      return NextResponse.json({ error: 'At least 2 registered teams required to generate brackets' }, { status: 400 });
    }

    const teams = [...tournament.registeredTeams].sort(() => 0.5 - Math.random());
    const matches = [];

    for (let i = 0; i < teams.length; i += 2) {
      matches.push({
        matchId: `M_${i/2 + 1}`,
        team1: teams[i],
        team2: teams[i+1] || 'BYE (Auto Advance)',
        status: teams[i+1] ? 'SCHEDULED' : 'FINISHED',
        winner: teams[i+1] ? '' : teams[i]
      });
    }

    const fixture = await Fixture.create({
      tournamentId,
      roundName: 'Round 1 / Brackets',
      matches
    });

    return NextResponse.json({
      success: true,
      message: 'Bracket Engine generated round fixtures!',
      fixture
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
