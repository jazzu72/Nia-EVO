import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  test('typed commands drive the canonical phase flow', () {
    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:typed',
        phase: GamePhase.briefing,
      ),
    );

    machine.dispatch(
      const GameCommand.start('MMQ-003'),
    );
    expect(machine.state.phase, GamePhase.planning);

    machine.dispatch(
      const GameCommand.explore(),
    );
    expect(machine.state.phase, GamePhase.exploring);

    machine.dispatch(
      const GameCommand.plan(),
    );
    expect(machine.state.phase, GamePhase.planning);

    machine.dispatch(
      const GameCommand.confirmPlan(),
    );
    expect(machine.state.phase, GamePhase.decision);

    machine.dispatch(
      const GameCommand.decide(
        'MMQ-003',
        'opt_save',
        seed: 42,
      ),
    );
    expect(machine.state.phase, GamePhase.resolving);
  });

  test('typed commands reject invalid mission data', () {
    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:invalid',
        phase: GamePhase.briefing,
      ),
    );

    expect(
      () => machine.dispatch(
        const GameCommand.start(''),
      ),
      throwsA(
        isA<StateError>(),
      ),
    );
  });
}
