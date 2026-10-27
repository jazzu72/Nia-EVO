import 'package:test/test.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_state_machine.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/scenario_result.dart';
import '../lib/domain/scenario_rules.dart';

void main() {
  test('decision resolves into deterministic domain event', () async {
    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:p1',
        phase: GamePhase.decision,
      ),
    );

    final repository = InMemoryWorldRepository();

    await repository.appendEvents(
      'player:p1',
      List.generate(
        6,
        (index) => DomainEvent(
          id: 'evt_${(index + 1).toString().padLeft(4, '0')}',
          type: 'prior_event',
          aggregateId: 'player:p1',
          sequence: index + 1,
          payload: const {},
        ),
      ),
      0,
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

    final event = await engine.resolve(
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

    expect(event, isA<ScenarioResult>());
    expect(event.missionId, 'probability_reef_01');
    expect(event.optionId, 'split_fleet');
    expect(event.seed, 42);
    expect(event.effects, hasLength(2));
    expect(event.learningSignals, contains('DECISION_RECORDED'));
    expect(event.recoveryOptions, contains('TRY_ALTERNATE_PATH'));
    expect(machine.state.phase, GamePhase.resolving);
  });
}
