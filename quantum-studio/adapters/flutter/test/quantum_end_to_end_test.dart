import 'package:test/test.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/event_replay.dart';

void main() {
  test('Quantum Odyssey decision survives append and replay', () async {
    final repo = InMemoryWorldRepository();

    final initial = WorldState(
      aggregateId: 'player:p1',
      phase: GamePhase.decision,
    );

    final event = DecisionResolved(
      aggregateId: 'player:p1',
      sequence: 1,
      missionId: 'probability_reef_01',
      optionId: 'split_fleet',
      seed: 42,
      effects: const [
        {
          'type': 'goalProgress',
          'key': 'reef_repair',
          'amount': 50,
        },
        {
          'type': 'knowledge',
          'key': 'diversification',
          'amount': 1,
        },
      ],
    );

    await repo.appendEvents('player:p1', [event], 0);

    final stored = await repo.loadEvents('player:p1');

    final rebuilt = EventReplay.replay(
      initialState: initial,
      events: stored,
    );

    await repo.saveSnapshot(rebuilt, event.sequence);

    final snapshot = await repo.loadSnapshot('player:p1');

    expect(stored.length, 1);
    expect(stored.first.payload['seed'], 42);
    expect(snapshot!.goalProgress['reef_repair'], 50);
    expect(snapshot.knowledge['diversification'], 1);
    expect(snapshot.phase, GamePhase.resolving);
  });
}
