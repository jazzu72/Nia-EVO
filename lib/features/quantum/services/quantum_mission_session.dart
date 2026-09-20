import 'dart:convert';
import 'dart:io';

import '../history/quantum_branch_history.dart';
import '../ledger/spark_coin_ledger.dart';
import '../state/quantum_player_state.dart';

class QuantumMissionSession {
  final QuantumPlayerState player;
  final SparkCoinLedger ledger;
  final QuantumBranchHistory history;

  QuantumMissionSession({
    required this.player,
    SparkCoinLedger? ledger,
    QuantumBranchHistory? history,
  })  : ledger = ledger ?? SparkCoinLedger(startingBalance: player.sparkCoins),
        history = history ?? QuantumBranchHistory();

  void applyBranch({
    required String nodeId,
    required String choiceId,
    required String outcomeId,
    required String nextNodeId,
    required String missionId,
    required int sparkCoinDelta,
    int xpDelta = 0,
  }) {
    ledger.apply(
      nodeId: nodeId,
      choiceId: choiceId,
      delta: sparkCoinDelta,
    );

    player.advance(
      nextNodeId: nextNodeId,
      sparkCoinDelta: sparkCoinDelta,
      xpDelta: xpDelta,
    );

    history.record(
      QuantumBranchHistoryEntry(
        missionId: missionId,
        nodeId: nodeId,
        choiceId: choiceId,
        outcomeId: outcomeId,
        sparkCoinDelta: sparkCoinDelta,
        nextNodeId: nextNodeId,
      ),
    );
  }

  Map<String, dynamic> toJson() => {
        'player': player.toJson(),
        'ledger': {
          'balance': ledger.balance,
          'history': ledger.history.map((e) => e.toJson()).toList(),
        },
        'branchHistory': history.toJson(),
      };

  Future<void> save(String path) async {
    final file = File(path);
    await file.parent.create(recursive: true);
    await file.writeAsString(
      const JsonEncoder.withIndent('  ').convert(toJson()),
    );
  }

  static Future<QuantumMissionSession> load(String path) async {
    final file = File(path);

    if (!await file.exists()) {
      throw StateError('Quantum mission session not found: $path');
    }

    final decoded = jsonDecode(await file.readAsString());

    if (decoded is! Map<String, dynamic>) {
      throw FormatException('Invalid Quantum mission session.');
    }

    final player = QuantumPlayerState.fromJson(
      Map<String, dynamic>.from(decoded['player'] as Map),
    );

    final ledgerJson = Map<String, dynamic>.from(decoded['ledger'] as Map);

    final ledgerHistory = ledgerJson['history'] as List<dynamic>? ?? [];

    final savedBalance = ledgerJson['balance'] as int? ?? player.sparkCoins;

    final totalDelta = ledgerHistory.fold<int>(
      0,
      (sum, item) {
        final transaction = Map<String, dynamic>.from(item as Map);
        return sum + (transaction['delta'] as int);
      },
    );

    final ledger = SparkCoinLedger(
      startingBalance: savedBalance - totalDelta,
    );

    for (final item in ledgerHistory) {
      final transaction = Map<String, dynamic>.from(item as Map);

      ledger.apply(
        nodeId: transaction['nodeId'] as String,
        choiceId: transaction['choiceId'] as String,
        delta: transaction['delta'] as int,
      );
    }

    final history = QuantumBranchHistory.fromJson(
      Map<String, dynamic>.from(decoded['branchHistory'] as Map),
    );

    return QuantumMissionSession(
      player: player,
      ledger: ledger,
      history: history,
    );
  }
}
