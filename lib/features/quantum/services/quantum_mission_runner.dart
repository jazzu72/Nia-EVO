import '../engine/quantum_branching_engine.dart';
import '../history/quantum_branch_history.dart';
import '../ledger/spark_coin_ledger.dart';

class QuantumMissionRunner {
  final QuantumBranchingEngine engine;
  final SparkCoinLedger ledger;
  final QuantumBranchHistory history;

  QuantumMissionRunner({
    QuantumBranchingEngine? engine,
    SparkCoinLedger? ledger,
    QuantumBranchHistory? history,
  })  : engine = engine ?? QuantumBranchingEngine(),
        ledger = ledger ?? SparkCoinLedger(),
        history = history ?? QuantumBranchHistory();

  QuantumBranchResult choose({
    required String missionId,
    required String nodePath,
    required String choiceId,
  }) {
    final node = engine.loadNode(nodePath);

    final result = engine.evaluate(
      node: node,
      choiceId: choiceId,
    );

    ledger.apply(
      nodeId: result.nodeId,
      choiceId: result.choiceId,
      delta: result.sparkCoinDelta,
    );

    history.record(
      QuantumBranchHistoryEntry(
        missionId: missionId,
        nodeId: result.nodeId,
        choiceId: result.choiceId,
        outcomeId: result.outcomeId,
        sparkCoinDelta: result.sparkCoinDelta,
        nextNodeId: result.nextNodeId,
      ),
    );

    return result;
  }

  int get sparkCoinBalance => ledger.balance;

  List<SparkCoinTransaction> get transactionHistory => ledger.history;

  List<QuantumBranchHistoryEntry> get branchHistory => history.entries;
}
