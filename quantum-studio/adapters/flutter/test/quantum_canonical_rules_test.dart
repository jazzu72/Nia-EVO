import 'package:test/test.dart';

import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  test('decision engine uses canonical Money Munchkins rules', () async {
    final repository = InMemoryWorldRepository();

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:canonical',
        phase: GamePhase.decision,
      ),
    );

    final engine = QuantumDecisionEngine(
      machine,
      repository: repository,
    );

    final result = await engine.resolve(
      missionId: 'MMQ-003',
      optionId: 'opt_save',
      seed: 42,
      effects: const [
        {
          'type': 'goalProgress',
          'key': 'budgeting',
          'amount': 10,
        },
      ],
    );

    expect(
      result.learningSignals,
      contains('SAVING_REINFORCED'),
    );

    expect(
      result.learningSignals,
      contains('DELAYED_GRATIFICATION'),
    );

    expect(
      result.recoveryOptions,
      contains('TRY_ALTERNATE_PATH'),
    );

    expect(result.missionId, 'MMQ-003');
    expect(result.optionId, 'opt_save');
    expect(result.seed, 42);
    expect(machine.state.phase, GamePhase.resolving);

    final events = await repository.loadEvents('player:canonical');

    expect(events.length, 1);
    expect(events.first.type, 'decision_resolved');
    expect(events.first.payload['missionId'], 'MMQ-003');
    expect(events.first.payload['optionId'], 'opt_save');
  });
}
