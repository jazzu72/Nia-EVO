import '../domain/quantum_events.dart';

class PlayerViewModel {
  final String playerName;
  final GamePhase phase;
  final int sparkCoins;
  final int xp;
  final Map<String, int> skills;
  final List<String> completedMissions;
  final List<String> unlockedLocations;

  const PlayerViewModel({
    required this.playerName,
    required this.phase,
    required this.sparkCoins,
    required this.xp,
    required this.skills,
    required this.completedMissions,
    required this.unlockedLocations,
  });

  factory PlayerViewModel.fromState(
    WorldState state, {
    String playerName = 'Explorer',
  }) {
    return PlayerViewModel(
      playerName: playerName,
      phase: state.phase,
      sparkCoins: state.playerResources['spark_coins'] ?? 0,
      xp: state.playerResources['xp'] ?? 0,
      skills: Map.unmodifiable(state.skills),
      completedMissions: List.unmodifiable(state.completedMissions),
      unlockedLocations: List.unmodifiable(state.unlockedLocations),
    );
  }

  double get progress {
    if (xp <= 0) return 0;
    return (xp / 100).clamp(0.0, 1.0);
  }

  bool get hasStartedMission => phase != GamePhase.briefing;

  bool isMissionComplete(String missionId) =>
      completedMissions.contains(missionId);

  bool isLocationUnlocked(String locationId) =>
      unlockedLocations.contains(locationId);
}
