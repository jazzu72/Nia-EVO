import 'quantum_events.dart';
import 'quantum_mission.dart';

class MissionProgression {
  const MissionProgression();

  WorldState complete({
    required QuantumMission mission,
    required WorldState state,
    int sparkCoins = 0,
    int xp = 0,
    String? skill,
  }) {
    if (state.completedMissions.contains(mission.id)) {
      return state.copyWith(
        phase: GamePhase.complete,
      );
    }

    final completed = [
      ...state.completedMissions,
      mission.id,
    ];

    final resources = Map<String, int>.from(
      state.playerResources,
    );

    resources['spark_coins'] = (resources['spark_coins'] ?? 0) + sparkCoins;

    resources['xp'] = (resources['xp'] ?? 0) + xp;

    final skills = Map<String, int>.from(
      state.skills,
    );

    if (skill != null && skill.isNotEmpty) {
      skills[skill] = (skills[skill] ?? 0) + 1;
    }

    return state.copyWith(
      phase: GamePhase.complete,
      completedMissions: completed,
      playerResources: resources,
      skills: skills,
    );
  }
}
