import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/repository/quantum_state_repository.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('Quantum player state survives save and reload', () async {
    final directory = await Directory.systemTemp.createTemp('quantum_test_');
    final path = '${directory.path}/pilot-001.json';

    final repository = QuantumStateRepository(filePath: path);

    final original = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'node-002',
      sparkCoins: 30,
      xp: 10,
    );

    await repository.save(original);

    expect(await repository.exists(), isTrue);

    final restored = await repository.load();

    expect(restored, isNotNull);
    expect(restored!.playerId, equals('pilot-001'));
    expect(restored.currentNodeId, equals('node-002'));
    expect(restored.sparkCoins, equals(30));
    expect(restored.xp, equals(10));

    await directory.delete(recursive: true);
  });

  test('Missing player state returns null', () async {
    final directory = await Directory.systemTemp.createTemp('quantum_missing_');
    final repository = QuantumStateRepository(
      filePath: '${directory.path}/missing.json',
    );

    expect(await repository.exists(), isFalse);
    expect(await repository.load(), isNull);

    await directory.delete(recursive: true);
  });
}
