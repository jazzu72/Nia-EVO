import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_transition.dart';

void main() {
  test('transition carries state and optional scenario result', () {
    const state = WorldState(
      aggregateId: 'player:transition',
      phase: GamePhase.resolving,
    );

    const transition = QuantumTransition(
      state: state,
    );

    expect(transition.state.aggregateId, 'player:transition');
    expect(transition.state.phase, GamePhase.resolving);
    expect(transition.scenario, isNull);
  });
}
