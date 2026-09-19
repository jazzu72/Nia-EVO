import '../state/quantum_player_state.dart';

class QuantumMissionCompletion {
  static const String completionNodeId = 'mission-complete';
  static const int completionXp = 50;

  static bool isComplete(String nodeId) {
    return nodeId == completionNodeId;
  }

  static void complete(
    QuantumPlayerState state, {
    required String missionId,
  }) {
    if (!state.completedNodes.contains(missionId)) {
      state.completedNodes.add(missionId);
      state.xp += completionXp;
    }
  }
}
