import 'mission_progression.dart';
import 'quantum_events.dart';
import 'quantum_mission.dart';
import 'quantum_transition.dart';

class MissionCompletion {
  final MissionProgression progression;

  const MissionCompletion({
    this.progression = const MissionProgression(),
  });

  QuantumTransition complete({
    required QuantumMission mission,
    required WorldState state,
    required int sparkCoins,
    required int xp,
    String? skill,
  }) {
    final nextState = progression.complete(
      mission: mission,
      state: state,
      sparkCoins: sparkCoins,
      xp: xp,
      skill: skill,
    );

    return QuantumTransition(
      state: nextState,
    );
  }
}
