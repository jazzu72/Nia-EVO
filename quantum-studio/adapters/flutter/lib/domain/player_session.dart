import 'game_command.dart';
import 'player_state_repository.dart';
import 'quantum_game_engine.dart';
import 'quantum_mission.dart';
import 'quantum_transition.dart';

class PlayerSession {
  final QuantumGameEngine engine;
  final PlayerStateRepository repository;

  const PlayerSession({
    required this.engine,
    required this.repository,
  });

  Future<QuantumTransition> dispatch(
    GameCommand command,
  ) {
    return engine.dispatch(command);
  }

  Future<QuantumTransition> completeMission({
    required QuantumMission mission,
    required int sparkCoins,
    required int xp,
    String? skill,
  }) {
    return engine.completeMission(
      mission: mission,
      sparkCoins: sparkCoins,
      xp: xp,
      skill: skill,
    );
  }

  Future<void> save() async {
    final version = await repository.version(
      engine.machine.state.aggregateId,
    );

    await repository.save(
      engine.machine.state,
      version,
    );
  }

  Future<void> resume() async {
    final saved = await repository.load(
      engine.machine.state.aggregateId,
    );

    if (saved == null) return;

    engine.machine.state = saved;
  }
}
