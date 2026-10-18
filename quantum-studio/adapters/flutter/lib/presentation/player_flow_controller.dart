import '../domain/game_command.dart';
import '../domain/player_session.dart';
import '../domain/quantum_mission.dart';
import '../domain/quantum_transition.dart';

class PlayerFlowController {
  final PlayerSession session;

  const PlayerFlowController({
    required this.session,
  });

  Future<QuantumTransition> startMission(
    String missionId,
  ) {
    return session.dispatch(
      GameCommand.start(missionId),
    );
  }

  Future<QuantumTransition> explore() {
    return session.dispatch(
      const GameCommand.explore(),
    );
  }

  Future<QuantumTransition> plan() {
    return session.dispatch(
      const GameCommand.plan(),
    );
  }

  Future<QuantumTransition> confirmPlan() {
    return session.dispatch(
      const GameCommand.confirmPlan(),
    );
  }

  Future<QuantumTransition> decide({
    required String missionId,
    required String optionId,
    required int seed,
    List<Map<String, dynamic>> effects = const [],
  }) {
    return session.dispatch(
      GameCommand.decide(
        missionId,
        optionId,
        seed: seed,
        effects: effects,
      ),
    );
  }

  Future<QuantumTransition> completeMission({
    required QuantumMission mission,
    required int sparkCoins,
    required int xp,
    String? skill,
  }) {
    return session.completeMission(
      mission: mission,
      sparkCoins: sparkCoins,
      xp: xp,
      skill: skill,
    );
  }

  Future<void> resume() {
    return session.resume();
  }
}
