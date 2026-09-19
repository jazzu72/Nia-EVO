import '../engine/quantum_branching_engine.dart';
import '../history/quantum_branch_history.dart';
import '../ledger/spark_coin_ledger.dart';
import '../services/quantum_mission_completion.dart';
import '../state/quantum_player_state.dart';
import 'quantum_mission_session.dart';

class QuantumMissionSessionRunner {
  final QuantumBranchingEngine engine;
  final QuantumMissionSession session;

  QuantumMissionSessionRunner({
    required QuantumPlayerState player,
    QuantumBranchingEngine? engine,
    QuantumMissionSession? session,
  })  : engine = engine ?? QuantumBranchingEngine(),
        session = session ?? QuantumMissionSession(player: player);

  QuantumBranchResult choose({
    required String missionId,
    required String nodePath,
    required String choiceId,
    int xpDelta = 0,
  }) {
    final node = engine.loadNode(nodePath);

    final result = engine.evaluate(
      node: node,
      choiceId: choiceId,
    );

    session.applyBranch(
      missionId: missionId,
      nodeId: result.nodeId,
      choiceId: result.choiceId,
      outcomeId: result.outcomeId,
      nextNodeId: result.nextNodeId,
      sparkCoinDelta: result.sparkCoinDelta,
      xpDelta: xpDelta,
    );

    if (QuantumMissionCompletion.isComplete(result.nextNodeId)) {
      QuantumMissionCompletion.complete(
        session.player,
        missionId: missionId,
      );
    }

    return result;
  }

  QuantumPlayerState get player => session.player;

  int get sparkCoinBalance => session.ledger.balance;

  List<SparkCoinTransaction> get transactionHistory => session.ledger.history;

  List<QuantumBranchHistoryEntry> get branchHistory => session.history.entries;
}
