import 'quantum_mission_card.dart';

class QuantumDashboardSnapshot {
  final String playerId;
  final String currentNodeId;
  final int sparkCoins;
  final int xp;
  final List<String> completedMissions;
  final List<QuantumMissionCard> missions;
  final QuantumMissionCard? currentMission;

  const QuantumDashboardSnapshot({
    required this.playerId,
    required this.currentNodeId,
    required this.sparkCoins,
    required this.xp,
    required this.completedMissions,
    required this.missions,
    required this.currentMission,
  });

  Map<String, dynamic> toJson() => {
        'playerId': playerId,
        'currentNodeId': currentNodeId,
        'sparkCoins': sparkCoins,
        'xp': xp,
        'completedMissions': List<String>.unmodifiable(
          completedMissions,
        ),
        'missions': List<Map<String, dynamic>>.unmodifiable(
          missions.map((mission) => mission.toJson()),
        ),
        'currentMission': currentMission?.toJson(),
      };
}
