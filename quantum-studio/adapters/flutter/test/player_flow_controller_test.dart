import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/player_session.dart';
import '../lib/domain/player_state_repository.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_game_engine.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/domain/quantum_state_machine.dart';
import '../lib/presentation/player_flow_controller.dart';

void main() {
  test('player flow drives a mission through the experience lifecycle',
      () async {
    final repository = InMemoryPlayerStateRepository();
    final worldRepository = InMemoryWorldRepository();

    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:flow',
        phase: GamePhase.briefing,
        playerResources: {
          'spark_coins': 50,
        },
      ),
      missions: {
        mission.id: mission,
      },
    );

    final engine = QuantumGameEngine(
      machine: machine,
      decisionEngine: QuantumDecisionEngine(
        machine,
        repository: worldRepository,
      ),
      playerRepository: repository,
    );

    final session = PlayerSession(
      engine: engine,
      repository: repository,
    );

    final flow = PlayerFlowController(
      session: session,
    );

    await flow.startMission('MMQ-003');
    expect(
      engine.machine.state.phase,
      GamePhase.planning,
    );

    await flow.explore();
    expect(
      engine.machine.state.phase,
      GamePhase.exploring,
    );

    await flow.plan();
    await flow.confirmPlan();

    expect(
      engine.machine.state.phase,
      GamePhase.decision,
    );

    final decision = await flow.decide(
      missionId: 'MMQ-003',
      optionId: 'opt_save',
      seed: 42,
      effects: const [
        {
          'type': 'goalProgress',
          'key': 'saving',
          'amount': 1,
        },
      ],
    );

    expect(
      decision.state.phase,
      GamePhase.resolving,
    );
    expect(
      decision.scenario!.optionId,
      'opt_save',
    );

    final completion = await flow.completeMission(
      mission: mission,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(
      completion.state.phase,
      GamePhase.complete,
    );
    expect(
      completion.state.playerResources['spark_coins'],
      80,
    );
    expect(
      completion.state.completedMissions,
      contains('MMQ-003'),
    );
  });
}
