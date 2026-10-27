import 'package:test/test.dart';

import '../lib/domain/game_command.dart';
import '../lib/domain/player_session.dart';
import '../lib/domain/player_state_repository.dart';
import '../lib/domain/quantum_decision_engine.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_game_engine.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/domain/quantum_state_machine.dart';

void main() {
  test('player session resumes persisted world state', () async {
    final repository = InMemoryPlayerStateRepository();

    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    final machine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:session',
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

    final session = PlayerSession(
      engine: engine,
      repository: repository,
    );

    await session.dispatch(
      const GameCommand.start('MMQ-003'),
    );

    await session.completeMission(
      mission: mission,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(
      engine.machine.state.playerResources['spark_coins'],
      80,
    );

    final resumedMachine = QuantumStateMachine(
      initialState: const WorldState(
        aggregateId: 'player:session',
        phase: GamePhase.briefing,
      ),
      missions: {
        mission.id: mission,
      },
    );

    final resumedEngine = QuantumGameEngine(
      machine: resumedMachine,
      decisionEngine: QuantumDecisionEngine(
        resumedMachine,
        repository: worldRepository,
      ),
      playerRepository: repository,
    );

    final resumedSession = PlayerSession(
      engine: resumedEngine,
      repository: repository,
    );

    await resumedSession.resume();

    expect(
      resumedEngine.machine.state.phase,
      GamePhase.complete,
    );
    expect(
      resumedEngine.machine.state.completedMissions,
      contains('MMQ-003'),
    );
    expect(
      resumedEngine.machine.state.skills['budgeting'],
      1,
    );
  });
}
