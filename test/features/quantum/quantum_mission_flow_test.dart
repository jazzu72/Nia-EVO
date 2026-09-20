import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_runner.dart';
import '../../../lib/features/quantum/ledger/spark_coin_ledger.dart';

void main() {
  test('Quantum mission saves 10 Spark Coins and advances to node-002', () {
    final ledger = SparkCoinLedger(startingBalance: 20);
    final runner = QuantumMissionRunner(ledger: ledger);

    final result = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-save',
    );

    expect(result.nodeId, equals('start-001'));
    expect(result.choiceId, equals('choice-save'));
    expect(result.sparkCoinDelta, equals(10));
    expect(result.nextNodeId, equals('node-002'));
    expect(runner.sparkCoinBalance, equals(30));
    expect(runner.transactionHistory.length, equals(1));
  });

  test('Quantum mission spend choice applies -5 Spark Coins', () {
    final ledger = SparkCoinLedger(startingBalance: 20);
    final runner = QuantumMissionRunner(ledger: ledger);

    final result = runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: 'lib/features/quantum/data/missions/start-001.json',
      choiceId: 'choice-spend',
    );

    expect(result.sparkCoinDelta, equals(-5));
    expect(result.nextNodeId, equals('node-002'));
    expect(runner.sparkCoinBalance, equals(15));
  });

  test('Quantum mission fixture exists', () {
    expect(
      File('lib/features/quantum/data/missions/start-001.json').existsSync(),
      isTrue,
    );
  });
}
