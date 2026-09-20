class QuantumMissionValidationResult {
  final bool isValid;
  final List<String> errors;

  const QuantumMissionValidationResult({
    required this.isValid,
    required this.errors,
  });
}

class QuantumMissionValidator {
  const QuantumMissionValidator();

  QuantumMissionValidationResult validate(
    Map<String, dynamic> node,
  ) {
    final errors = <String>[];
    final nodeId = node['nodeId'];

    if (nodeId is! String || nodeId.isEmpty) {
      errors.add('Missing nodeId.');
    }

    final choices = node['choices'];
    final outcomes = node['outcomes'];

    if (choices is! List) {
      errors.add('Node "$nodeId" has no valid choices list.');
    }

    if (outcomes is! List) {
      errors.add('Node "$nodeId" has no valid outcomes list.');
    }

    if (choices is List && outcomes is List) {
      final outcomeIds = outcomes
          .whereType<Map>()
          .map((item) => item['outcomeId'])
          .whereType<String>()
          .toSet();

      for (final rawChoice in choices) {
        if (rawChoice is! Map) {
          errors.add('Node "$nodeId" contains an invalid choice.');
          continue;
        }

        final choiceId = rawChoice['choiceId'];
        final outcomeId = rawChoice['outcomeId'];

        if (choiceId is! String || choiceId.isEmpty) {
          errors.add('Node "$nodeId" contains a choice without choiceId.');
        }

        if (outcomeId is! String || !outcomeIds.contains(outcomeId)) {
          errors.add(
            'Choice "$choiceId" references missing outcome "$outcomeId".',
          );
        }
      }

      for (final rawOutcome in outcomes) {
        if (rawOutcome is! Map) {
          errors.add('Node "$nodeId" contains an invalid outcome.');
          continue;
        }

        final outcomeId = rawOutcome['outcomeId'];
        final nextNodeId = rawOutcome['nextNodeId'];

        if (outcomeId is! String || outcomeId.isEmpty) {
          errors.add('Node "$nodeId" contains an outcome without outcomeId.');
        }

        if (nextNodeId is! String || nextNodeId.isEmpty) {
          errors.add(
            'Outcome "$outcomeId" has no valid nextNodeId.',
          );
        }
      }
    }

    return QuantumMissionValidationResult(
      isValid: errors.isEmpty,
      errors: List.unmodifiable(errors),
    );
  }
}
