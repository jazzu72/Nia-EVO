import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_completion.dart';
import '../../../lib/features/quantum/services/quantum_mission_session_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('session runner applies branch exactly once', () {
    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final runner = QuantumMissionSessionRunner(
      player: player,
    );

    final result = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-save',
    );

    expect(result.sparkCoinDelta, 10);
    expect(result.nextNodeId, 'node-002');
    expect(runner.player.currentNodeId, 'node-002');
    expect(runner.player.sparkCoins, 30);
    expect(runner.sparkCoinBalance, 30);
    expect(runner.branchHistory.length, 1);
    expect(runner.branchHistory.first.choiceId, 'choice-save');
  });

  test('session runner completes mission and awards 50 XP once', () {
    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'node-003',
      sparkCoins: 30,
    );

    final runner = QuantumMissionSessionRunner(
      player: player,
    );

    final result = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/node-003.json',
      choiceId: 'choice-budget',
    );

    expect(result.nextNodeId, 'mission-complete');
    expect(runner.player.currentNodeId, 'mission-complete');
    expect(runner.player.xp, 50);
    expect(
      runner.player.completedNodes,
      contains('mission-bike-savings'),
    );

    QuantumMissionCompletion.complete(
      runner.player,
      missionId: 'mission-bike-savings',
    );

    expect(runner.player.xp, 50);
  });
}
