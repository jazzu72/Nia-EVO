import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_session_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('bike savings mission produces the expected 20 → 30 → 40 → 55 economy',
      () {
    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final runner = QuantumMissionSessionRunner(
      player: player,
    );

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-save',
    );

    expect(runner.sparkCoinBalance, 30);

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/node-002.json',
      choiceId: 'choice-plan',
    );

    expect(runner.sparkCoinBalance, 40);

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/node-003.json',
      choiceId: 'choice-budget',
    );

    expect(runner.sparkCoinBalance, 55);
    expect(runner.transactionHistory.length, 3);
    expect(
      runner.transactionHistory.map((transaction) => transaction.delta),
      [10, 10, 15],
    );
  });
}
