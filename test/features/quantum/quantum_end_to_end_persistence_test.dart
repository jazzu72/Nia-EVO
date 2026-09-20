import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_session.dart';
import '../../../lib/features/quantum/services/quantum_mission_session_runner.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('complete mission state survives save and reload', () async {
    final directory = await Directory.systemTemp.createTemp(
      'nia_quantum_persistence_',
    );
    final path = '${directory.path}/mission_session.json';

    try {
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

      runner.choose(
        missionId: 'mission-bike-savings',
        nodePath: 'lib/features/quantum/data/missions/node-002.json',
        choiceId: 'choice-plan',
      );

      runner.choose(
        missionId: 'mission-bike-savings',
        nodePath: 'lib/features/quantum/data/missions/node-003.json',
        choiceId: 'choice-budget',
      );

      await runner.session.save(path);

      final restored = await QuantumMissionSession.load(path);

      expect(restored.player.playerId, 'pilot-001');
      expect(restored.player.currentNodeId, 'mission-complete');
      expect(restored.player.sparkCoins, 55);
      expect(restored.player.xp, 50);
      expect(
        restored.player.completedNodes,
        contains('mission-bike-savings'),
      );
      expect(restored.ledger.balance, 55);
      expect(restored.ledger.history.length, 3);
      expect(restored.history.entries.length, 3);
    } finally {
      await directory.delete(recursive: true);
    }
  });

  test('completed mission lifecycle persists completion state', () async {
    final temp = Directory.systemTemp.createTempSync('nia-quantum-final-');
    final path = '${temp.path}/session.json';

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'mission-complete',
      sparkCoins: 75,
      xp: 100,
      completedNodes: ['mission-bike-savings'],
    );

    final session = QuantumMissionSession(
      player: player,
    );

    await session.save(path);

    final restored = await QuantumMissionSession.load(path);

    expect(
      restored.player.completedNodes,
      contains('mission-bike-savings'),
    );
    expect(restored.player.currentNodeId, 'mission-complete');
    expect(restored.player.sparkCoins, 75);
    expect(restored.player.xp, 100);

    temp.deleteSync(recursive: true);
  });
}
