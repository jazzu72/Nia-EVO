import 'package:test/test.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_state_machine.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/event_replay.dart';
import '../lib/domain/scenario_rules.dart';

void main() {
  test('decision event persists and replays deterministically', () async {
    final repository = InMemoryWorldRepository();

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:p1',
        phase: GamePhase.decision,
      ),
    );

    final engine = QuantumDecisionEngine(
      machine,
      repository: repository,
      rules: const ScenarioRules(
        learningSignals: {
          'split_fleet': [
            'DECISION_RECORDED',
            'CONSEQUENCES_APPLIED',
          ],
        },
        recoveryOptions: {
          'split_fleet': [
            'REFLECT_ON_OUTCOME',
            'TRY_ALTERNATE_PATH',
          ],
        },
      ),
    );

    final result = await engine.resolve(
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

    expect(result.missionId, 'probability_reef_01');
    expect(result.optionId, 'split_fleet');
    expect(result.seed, 42);
    expect(result.effects, hasLength(2));
    expect(result.learningSignals, contains('DECISION_RECORDED'));
    expect(result.recoveryOptions, contains('TRY_ALTERNATE_PATH'));

    final events = await repository.loadEvents('player:p1');

    final replayed = EventReplay.replay(
      initialState: const WorldState(
        aggregateId: 'player:p1',
        phase: GamePhase.decision,
      ),
      events: events,
    );

    await repository.saveSnapshot(
      replayed,
      events.last.sequence,
    );

    final snapshot = await repository.loadSnapshot('player:p1');

    expect(events, hasLength(1));
    expect(events.first.sequence, 1);
    expect(events.first.type, 'decision_resolved');
    expect(events.first.aggregateId, 'player:p1');
    expect(events.first.payload['missionId'], result.missionId);
    expect(events.first.payload['optionId'], result.optionId);
    expect(events.first.payload['seed'], result.seed);
    expect(events.first.payload['effects'], result.effects);
    expect(events.first.payload['seed'], 42);
    expect(replayed.goalProgress['reef_repair'], 50);
    expect(replayed.knowledge['diversification'], 1);
    expect(replayed.phase, GamePhase.resolving);
    expect(snapshot!.goalProgress['reef_repair'], 50);
    expect(snapshot.knowledge['diversification'], 1);
  });
}
