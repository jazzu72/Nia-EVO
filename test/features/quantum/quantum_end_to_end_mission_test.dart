import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_session_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('complete mission journey preserves state across every branch', () {
    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final runner = QuantumMissionSessionRunner(
      player: player,
    );

    final first = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-save',
    );

    expect(first.nextNodeId, 'node-002');
    expect(runner.player.sparkCoins, 30);

    final second = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/node-002.json',
      choiceId: 'choice-plan',
    );

    expect(second.nextNodeId, 'node-003');

    final third = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/node-003.json',
      choiceId: 'choice-budget',
    );

    expect(third.nextNodeId, 'mission-complete');
    expect(runner.player.currentNodeId, 'mission-complete');
    expect(runner.player.sparkCoins, 55);
    expect(runner.player.xp, 50);
    expect(
      runner.player.completedNodes,
      contains('mission-bike-savings'),
    );
    expect(runner.branchHistory.length, 3);
    expect(runner.sparkCoinBalance, 55);
  });
}
