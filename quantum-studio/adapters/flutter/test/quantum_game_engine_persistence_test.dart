import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/player_state_repository.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_game_engine.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  test('game engine persists completed mission state', () async {
    final repository = InMemoryPlayerStateRepository();

    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:engine',
        phase: GamePhase.briefing,
        playerResources: {
          'spark_coins': 50,
        },
      ),
      missions: {
        mission.id: mission,
      },
    );

    final worldRepository = InMemoryWorldRepository();

    final engine = QuantumGameEngine(
      machine: machine,
      decisionEngine: QuantumDecisionEngine(
        machine,
        repository: worldRepository,
      ),
      playerRepository: repository,
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

    final transition = await engine.completeMission(
      mission: mission,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(
      transition.state.phase,
      GamePhase.complete,
    );

    final saved = await repository.load(
      'player:engine',
    );

    expect(saved, isNotNull);
    expect(
      saved!.completedMissions,
      contains('MMQ-003'),
    );
    expect(
      saved.playerResources['spark_coins'],
      80,
    );
    expect(
      saved.playerResources['xp'],
      30,
    );
    expect(
      saved.skills['budgeting'],
      1,
    );
    expect(
      await repository.version('player:engine'),
      1,
    );
  });
}
