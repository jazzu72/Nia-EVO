import 'dart:convert';
import 'dart:io';

class QuantumBranchResult {
  final String nodeId;
  final String choiceId;
  final String outcomeId;
  final String description;
  final int sparkCoinDelta;
  final String nextNodeId;

  const QuantumBranchResult({
    required this.nodeId,
    required this.choiceId,
    required this.outcomeId,
    required this.description,
    required this.sparkCoinDelta,
    required this.nextNodeId,
  });
}

class QuantumBranchingEngine {
  Map<String, dynamic> loadNode(String path) {
    final file = File(path);

    if (!file.existsSync()) {
      throw StateError('Quantum node not found: $path');
    }

    final decoded = jsonDecode(file.readAsStringSync());

    if (decoded is! Map<String, dynamic>) {
      throw FormatException('Invalid QuantumNode JSON: $path');
    }

    return decoded;
  }

  QuantumBranchResult evaluate({
    required Map<String, dynamic> node,
    required String choiceId,
  }) {
    final choices = List<Map<String, dynamic>>.from(
      (node['choices'] as List<dynamic>? ?? []).map(
        (item) => Map<String, dynamic>.from(item as Map),
      ),
    );

    final choice = choices.cast<Map<String, dynamic>?>().firstWhere(
          (item) => item?['choiceId'] == choiceId,
          orElse: () => null,
        );

    if (choice == null) {
      throw StateError(
        'Choice "$choiceId" is not available at node "${node['nodeId']}".',
      );
    }

    final outcomeId = choice['outcomeId'] as String;

    final outcomes = List<Map<String, dynamic>>.from(
      (node['outcomes'] as List<dynamic>? ?? []).map(
        (item) => Map<String, dynamic>.from(item as Map),
      ),
    );

    final outcome = outcomes.cast<Map<String, dynamic>?>().firstWhere(
          (item) => item?['outcomeId'] == outcomeId,
          orElse: () => null,
        );

    if (outcome == null) {
      throw StateError(
        'Outcome "$outcomeId" not found for node "${node['nodeId']}".',
      );
    }

    final rewards = outcome['rewards'] as int? ?? 0;
    final penalties = outcome['penalties'] as int? ?? 0;

    return QuantumBranchResult(
      nodeId: node['nodeId'] as String,
      choiceId: choiceId,
      outcomeId: outcomeId,
      description: outcome['description'] as String,
      sparkCoinDelta: rewards - penalties,
      nextNodeId: outcome['nextNodeId'] as String,
    );
  }
}
