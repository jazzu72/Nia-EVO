import 'game_command.dart';
import 'mission_completion.dart';
import 'player_state_repository.dart';
import 'quantum_decision_engine.dart';
import 'quantum_events.dart';
import 'quantum_mission.dart';
import 'quantum_state_machine.dart';
import 'quantum_transition.dart';

class QuantumGameEngine {
  final QuantumStateMachine machine;
  final QuantumDecisionEngine decisionEngine;
  final MissionCompletion missionCompletion;
  final PlayerStateRepository? playerRepository;

  QuantumGameEngine({
    required this.machine,
    required this.decisionEngine,
    this.missionCompletion = const MissionCompletion(),
    this.playerRepository,
  });

  Future<QuantumTransition> dispatch(GameCommand command) async {
    if (command is Decide) {
      if (machine.state.phase != GamePhase.decision) {
        throw StateError(
          'INVALID_PHASE_FOR_DECISION:${machine.state.phase}',
        );
      }

      final result = await decisionEngine.resolve(
        missionId: command.missionId,
        optionId: command.optionId,
        seed: command.seed,
        effects: command.effects,
      );

      return QuantumTransition(
        state: machine.state,
        scenario: result,
      );
    }

    machine.dispatch(command);

    return QuantumTransition(
      state: machine.state,
    );
  }

  Future<QuantumTransition> completeMission({
    required QuantumMission mission,
    required int sparkCoins,
    required int xp,
    String? skill,
  }) async {
    final repository = playerRepository;
    if (repository == null) {
      throw StateError('PLAYER_REPOSITORY_REQUIRED');
    }

    final expectedVersion = await repository.version(machine.state.aggregateId);

    final transition = missionCompletion.complete(
      mission: mission,
      state: machine.state,
      sparkCoins: sparkCoins,
      xp: xp,
      skill: skill,
    );

    await repository.save(
      transition.state,
      expectedVersion,
    );

    machine.state = transition.state;

    return transition;
  }
}
