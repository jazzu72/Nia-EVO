sealed class GameCommand {
  const GameCommand();

  const factory GameCommand.start(String missionId) = StartMission;
  const factory GameCommand.explore() = Explore;
  const factory GameCommand.plan() = Plan;
  const factory GameCommand.confirmPlan() = ConfirmPlan;
  const factory GameCommand.decide(
    String missionId,
    String optionId, {
    required int seed,
    List<Map<String, dynamic>> effects,
  }) = Decide;
}

class StartMission extends GameCommand {
  final String missionId;

  const StartMission(this.missionId);
}

class Explore extends GameCommand {
  const Explore();
}

class Plan extends GameCommand {
  const Plan();
}

class ConfirmPlan extends GameCommand {
  const ConfirmPlan();
}

class Decide extends GameCommand {
  final String missionId;
  final String optionId;
  final int seed;
  final List<Map<String, dynamic>> effects;

  const Decide(
    this.missionId,
    this.optionId, {
    required this.seed,
    this.effects = const [],
  });
}
