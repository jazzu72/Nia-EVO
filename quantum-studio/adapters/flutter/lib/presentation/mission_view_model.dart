import '../domain/quantum_events.dart';
import '../domain/quantum_mission.dart';

class MissionRewardViewModel {
  final int sparkCoins;
  final int xp;

  const MissionRewardViewModel({
    required this.sparkCoins,
    required this.xp,
  });
}

class MissionViewModel {
  final String id;
  final String title;
  final String description;
  final String skill;
  final int difficulty;
  final MissionRewardViewModel reward;
  final List<String> optionIds;
  final bool completed;

  const MissionViewModel({
    required this.id,
    required this.title,
    required this.description,
    required this.skill,
    required this.difficulty,
    required this.reward,
    required this.optionIds,
    required this.completed,
  });

  factory MissionViewModel.fromMission({
    required QuantumMission mission,
    required WorldState state,
    String? description,
    String? skill,
    int difficulty = 1,
    int sparkCoins = 0,
    int xp = 0,
  }) {
    return MissionViewModel(
      id: mission.id,
      title: mission.title,
      description: description ?? 'Complete this mission to grow your skills.',
      skill: skill ?? 'money_basics',
      difficulty: difficulty,
      reward: MissionRewardViewModel(
        sparkCoins: sparkCoins,
        xp: xp,
      ),
      optionIds: List.unmodifiable(mission.optionIds),
      completed: state.completedMissions.contains(mission.id),
    );
  }

  bool get playable => !completed;

  bool hasOption(String optionId) => optionIds.contains(optionId);
}
