import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/repository/quantum_state_repository.dart';
import '../../../lib/features/quantum/services/quantum_mission_completion.dart';
import '../../../lib/features/quantum/services/quantum_mission_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';
import '../../../lib/features/quantum/ledger/spark_coin_ledger.dart';

void main() {
  test('Complete Quantum lifecycle persists mission completion', () async {
    final state = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
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

    expect(state.currentNodeId, equals('node-002'));
    expect(state.sparkCoins, equals(30));
    expect(state.xp, equals(10));

    state.currentNodeId = 'mission-complete';

    expect(
      QuantumMissionCompletion.isComplete(state.currentNodeId),
      isTrue,
    );

    QuantumMissionCompletion.complete(
      state,
      missionId: 'mission-bike-savings',
    );

    expect(state.completedNodes, contains('mission-bike-savings'));
    expect(state.xp, equals(60));

    final directory =
        await Directory.systemTemp.createTemp('quantum_lifecycle_');
    final repository = QuantumStateRepository(
      filePath: '${directory.path}/pilot-001.json',
    );

    await repository.save(state);
    final restored = await repository.load();

    expect(restored, isNotNull);
    expect(restored!.sparkCoins, equals(30));
    expect(restored.xp, equals(60));
    expect(restored.currentNodeId, equals('mission-complete'));
    expect(
      restored.completedNodes,
      contains('mission-bike-savings'),
    );

    await directory.delete(recursive: true);
  });
}
