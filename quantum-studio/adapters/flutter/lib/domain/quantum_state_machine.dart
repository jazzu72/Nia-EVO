import 'game_command.dart';
import 'quantum_mission.dart';
import 'quantum_events.dart';

class QuantumStateMachine {
  WorldState state;
  final Map<String, QuantumMission> missions;
  String? activeMissionId;

  QuantumStateMachine({
    required WorldState initialState,
    this.missions = const {},
  }) : state = initialState;

  WorldState dispatch(GameCommand command) {
    if (command is StartMission) {
      _require(GamePhase.briefing);
      if (command.missionId.isEmpty) {
        throw StateError('MISSION_ID_REQUIRED');
      }

      final mission = missions[command.missionId];
      if (missions.isNotEmpty && mission == null) {
        throw StateError(
          'MISSION_NOT_FOUND:${command.missionId}',
        );
      }

      activeMissionId = command.missionId;
      state = state.copyWith(phase: GamePhase.planning);
      return state;
    }

    if (command is Explore) {
      _require(GamePhase.planning);
      state = state.copyWith(phase: GamePhase.exploring);
      return state;
    }

    if (command is Plan) {
      _require(GamePhase.exploring);
      state = state.copyWith(phase: GamePhase.planning);
      return state;
    }

    if (command is ConfirmPlan) {
      _require(GamePhase.planning);
      state = state.copyWith(phase: GamePhase.decision);
      return state;
    }

    if (command is Decide) {
      _require(GamePhase.decision);
      if (command.missionId.isEmpty) {
        throw StateError('MISSION_ID_REQUIRED');
      }
      if (command.optionId.isEmpty) {
        throw StateError('OPTION_ID_REQUIRED');
      }

      final mission = missions[command.missionId];

      if (missions.isNotEmpty && mission == null) {
        throw StateError(
          'MISSION_NOT_FOUND:${command.missionId}',
        );
      }

      if (mission != null && !mission.hasOption(command.optionId)) {
        throw StateError(
          'OPTION_NOT_FOUND:${command.optionId}',
        );
      }

      if (activeMissionId != null && activeMissionId != command.missionId) {
        throw StateError(
          'MISSION_NOT_ACTIVE:${command.missionId}',
        );
      }

      state = state.copyWith(phase: GamePhase.resolving);
      return state;
    }

    throw StateError(
      'UNKNOWN_COMMAND:${command.runtimeType}',
    );
  }

  void _require(GamePhase expected) {
    if (state.phase != expected) {
      throw StateError(
        'INVALID_PHASE:expected=$expected actual=${state.phase}',
      );
    }
  }
}
