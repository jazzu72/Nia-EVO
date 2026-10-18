import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  const mission = QuantumMission(
    id: 'MMQ-003',
    title: 'Build Your First Budget',
    optionIds: [
      'opt_save',
      'opt_spend',
    ],
  );

  test('state machine activates a known mission', () {
    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:mission',
        phase: GamePhase.briefing,
      ),
      missions: const {
        'MMQ-003': mission,
      },
    );

    machine.dispatch(
      const GameCommand.start('MMQ-003'),
    );

    expect(machine.activeMissionId, 'MMQ-003');
  });

  test('state machine rejects an unknown option', () {
    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:mission-option',
        phase: GamePhase.briefing,
      ),
      missions: const {
        'MMQ-003': mission,
      },
    );

    machine.dispatch(
      const GameCommand.start('MMQ-003'),
    );
    machine.dispatch(const GameCommand.explore());
    machine.dispatch(const GameCommand.plan());
    machine.dispatch(const GameCommand.confirmPlan());

    expect(
      () => machine.dispatch(
        const GameCommand.decide(
          'MMQ-003',
          'not_a_real_option',
          seed: 42,
        ),
      ),
      throwsA(isA<StateError>()),
    );
  });
}
