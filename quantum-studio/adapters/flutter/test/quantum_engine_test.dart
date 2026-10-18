import 'package:test/test.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/event_replay.dart';

void main() {
  test('decision event preserves deterministic seed and effects', () {
    final event = DecisionResolved(
      aggregateId: 'player:p1',
      sequence: 7,
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

    expect(event.id, 'evt_0007');
    expect(event.type, 'decision_resolved');
    expect(event.sequence, 7);
    expect(event.payload['missionId'], 'probability_reef_01');
    expect(event.payload['optionId'], 'split_fleet');
    expect(event.payload['seed'], 42);
    expect(event.payload['effects'], hasLength(2));
  });

  test('repository enforces optimistic concurrency', () async {
    final repo = InMemoryWorldRepository();

    await repo.appendEvents(
      'player:p1',
      [
        DecisionResolved(
          aggregateId: 'player:p1',
          sequence: 1,
          missionId: 'probability_reef_01',
          optionId: 'split_fleet',
          seed: 42,
          effects: const [],
        ),
      ],
      0,
    );

    expect(
      () => repo.appendEvents('player:p1', const [], 0),
      throwsA(isA<StateError>()),
    );
  });

  test('event replay reconstructs deterministic world state', () {
    final initial = WorldState(
      aggregateId: 'player:p1',
      phase: GamePhase.decision,
    );

    final events = [
      DecisionResolved(
        aggregateId: 'player:p1',
        sequence: 7,
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
      ),
    ];

    final result = EventReplay.replay(
      initialState: initial,
      events: events,
    );

    expect(result.goalProgress['reef_repair'], 50);
    expect(result.knowledge['diversification'], 1);
    expect(result.phase, GamePhase.resolving);
  });
}
