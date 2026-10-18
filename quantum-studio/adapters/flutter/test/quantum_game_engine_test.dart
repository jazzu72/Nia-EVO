import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_game_engine.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  test('typed Decide command resolves through the decision engine', () async {
    final repository = InMemoryWorldRepository();

    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:game',
        phase: GamePhase.briefing,
      ),
      missions: const {
        'MMQ-003': mission,
      },
    );

    final decisionEngine = QuantumDecisionEngine(
      machine,
      repository: repository,
    );

    final engine = QuantumGameEngine(
      machine: machine,
      decisionEngine: decisionEngine,
    );

    await engine.dispatch(
      const GameCommand.start('MMQ-003'),
    );
    await engine.dispatch(
      const GameCommand.explore(),
    );
    await engine.dispatch(
      const GameCommand.plan(),
    );
    await engine.dispatch(
      const GameCommand.confirmPlan(),
    );

    final transition = await engine.dispatch(
      const GameCommand.decide(
        'MMQ-003',
        'opt_save',
        seed: 42,
        effects: [
          {
            'type': 'goalProgress',
            'key': 'budgeting',
            'amount': 10,
          },
        ],
      ),
    );

    expect(transition.scenario, isNotNull);
    expect(
      transition.scenario!.missionId,
      'MMQ-003',
    );
    expect(
      transition.scenario!.optionId,
      'opt_save',
    );
    expect(transition.scenario!.seed, 42);
    expect(
      transition.scenario!.learningSignals,
      contains('SAVING_REINFORCED'),
    );
    expect(
      transition.scenario!.recoveryOptions,
      contains('TRY_ALTERNATE_PATH'),
    );

    expect(
      machine.state.phase,
      GamePhase.resolving,
    );

    final events = await repository.loadEvents(
      'player:game',
    );

    expect(events.length, 1);
    expect(
      events.first.type,
      'decision_resolved',
    );
  });
}
