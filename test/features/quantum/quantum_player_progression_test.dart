import 'package:test/test.dart';

import '../../../lib/features/quantum/ledger/spark_coin_ledger.dart';
import '../../../lib/features/quantum/services/quantum_mission_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('Player progresses through Quantum mission with Spark Coins and XP', () {
    final state = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
      xp: 0,
    );

    final ledger = SparkCoinLedger(startingBalance: state.sparkCoins);
    final runner = QuantumMissionRunner(ledger: ledger);

    final result = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-save',
    );

    state.advance(
      nextNodeId: result.nextNodeId,
      sparkCoinDelta: result.sparkCoinDelta,
      xpDelta: 10,
    );

    expect(state.playerId, equals('pilot-001'));
    expect(state.currentNodeId, equals('node-002'));
    expect(state.sparkCoins, equals(30));
    expect(state.xp, equals(10));
    expect(runner.sparkCoinBalance, equals(30));
    expect(runner.transactionHistory.length, equals(1));
  });

  test('Player state survives JSON serialization', () {
    final original = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'node-002',
      sparkCoins: 30,
      xp: 10,
    );

    final restored = QuantumPlayerState.fromJson(original.toJson());

    expect(restored.playerId, equals('pilot-001'));
    expect(restored.currentNodeId, equals('node-002'));
    expect(restored.sparkCoins, equals(30));
    expect(restored.xp, equals(10));
  });
}
