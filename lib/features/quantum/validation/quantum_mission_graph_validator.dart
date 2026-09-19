import 'dart:convert';
import 'dart:io';

class QuantumMissionGraphValidationResult {
  final bool isValid;
  final List<String> errors;
  final List<String> visitedNodes;

  const QuantumMissionGraphValidationResult({
    required this.isValid,
    required this.errors,
    required this.visitedNodes,
  });
}

class QuantumMissionGraphValidator {
  const QuantumMissionGraphValidator();

  QuantumMissionGraphValidationResult validate({
    required String startNodePath,
    required String missionDirectory,
    String completionNodeId = 'mission-complete',
  }) {
    final errors = <String>[];
    final visited = <String>[];
    final visiting = <String>{};
    final reachableCompletion = <bool>[false];

    void visit(String nodeId, String path) {
      if (nodeId == completionNodeId) {
        reachableCompletion[0] = true;
        return;
      }

      if (visiting.contains(nodeId)) {
        errors.add('Cycle detected at node "$nodeId".');
        return;
      }

      if (visited.contains(nodeId)) return;

      final file = File(path);

      if (!file.existsSync()) {
        errors.add('Missing node file for "$nodeId": $path');
        return;
      }

      dynamic decoded;

      try {
        decoded = jsonDecode(file.readAsStringSync());
      } catch (error) {
        errors.add('Invalid JSON for node "$nodeId": $error');
        return;
      }

      if (decoded is! Map<String, dynamic>) {
        errors.add('Node "$nodeId" is not a valid JSON object.');
        return;
      }

      visited.add(nodeId);
      visiting.add(nodeId);

      try {
        final outcomes = decoded['outcomes'];

        if (outcomes is! List) {
          errors.add('Node "$nodeId" has no valid outcomes list.');
          return;
        }

        for (final rawOutcome in outcomes) {
          if (rawOutcome is! Map) {
            errors.add('Node "$nodeId" contains an invalid outcome.');
            continue;
          }

          final nextNodeId = rawOutcome['nextNodeId'];

          if (nextNodeId is! String || nextNodeId.isEmpty) {
            errors
                .add('Node "$nodeId" contains an outcome without nextNodeId.');
            continue;
          }

          visit(
            nextNodeId,
            '$missionDirectory/$nextNodeId.json',
          );
        }
      } finally {
        visiting.remove(nodeId);
      }
    }

    final startFile = File(startNodePath);

    if (!startFile.existsSync()) {
      errors.add('Start node not found: $startNodePath');
    } else {
      final startNodeId =
          startFile.uri.pathSegments.last.replaceFirst('.json', '');
      visit(startNodeId, startNodePath);
    }

    if (!reachableCompletion[0]) {
      errors.add(
        'Mission completion node "$completionNodeId" is not reachable.',
      );
    }

    return QuantumMissionGraphValidationResult(
      isValid: errors.isEmpty,
      errors: List.unmodifiable(errors),
      visitedNodes: List.unmodifiable(visited),
    );
  }
}
