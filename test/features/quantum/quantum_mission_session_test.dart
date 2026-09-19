import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/services/quantum_mission_session.dart';
import '../../../lib/features/quantum/state/quantum_player_state.dart';

void main() {
  test('Quantum session survives save and reload', () async {
    final directory = await Directory.systemTemp.createTemp('quantum_session_');
    final path = '${directory.path}/mission-session.json';

    final session = QuantumMissionSession(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
        sparkCoins: 20,
      ),
    );

    session.applyBranch(
      missionId: 'mission-bike-savings',
      nodeId: 'start-001',
      choiceId: 'choice-save',
      outcomeId: 'outcome-save',
      nextNodeId: 'node-002',
      sparkCoinDelta: 10,
      xpDelta: 10,
    );

    expect(session.player.currentNodeId, equals('node-002'));
    expect(session.player.sparkCoins, equals(30));
    expect(session.player.xp, equals(10));
    expect(session.ledger.balance, equals(30));
    expect(session.history.entries.length, equals(1));

    await session.save(path);

    final restored = await QuantumMissionSession.load(path);

    expect(restored.player.playerId, equals('pilot-001'));
    expect(restored.player.currentNodeId, equals('node-002'));
    expect(restored.player.sparkCoins, equals(30));
    expect(restored.player.xp, equals(10));
    expect(restored.ledger.balance, equals(30));
    expect(restored.ledger.history.length, equals(1));
    expect(restored.history.entries.length, equals(1));
    expect(
      restored.history.entries.first.choiceId,
      equals('choice-save'),
    );
    expect(
      restored.history.entries.first.nextNodeId,
      equals('node-002'),
    );

    await directory.delete(recursive: true);
  });
}
