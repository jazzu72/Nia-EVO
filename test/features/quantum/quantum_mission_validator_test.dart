import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/validation/quantum_mission_validator.dart';

void main() {
  test('Validates the bike savings mission node', () {
    final file = File(
      'lib/features/quantum/data/missions/start-001.json',
    );

    final node = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;

    const validator = QuantumMissionValidator();
    final result = validator.validate(node);

    expect(result.isValid, isTrue);
    expect(result.errors, isEmpty);
  });

  test('Rejects a choice that references a missing outcome', () {
    final node = <String, dynamic>{
      'nodeId': 'broken-node',
      'choices': [
        {
          'choiceId': 'bad-choice',
          'outcomeId': 'missing-outcome',
        },
      ],
      'outcomes': [],
    };

    const validator = QuantumMissionValidator();
    final result = validator.validate(node);

    expect(result.isValid, isFalse);
    expect(result.errors, isNotEmpty);
    expect(
      result.errors.first,
      contains('missing-outcome'),
    );
  });

  test('Rejects an outcome without a next node', () {
    final node = <String, dynamic>{
      'nodeId': 'broken-node',
      'choices': [
        {
          'choiceId': 'choice-001',
          'outcomeId': 'outcome-001',
        },
      ],
      'outcomes': [
        {
          'outcomeId': 'outcome-001',
        },
      ],
    };

    const validator = QuantumMissionValidator();
    final result = validator.validate(node);

    expect(result.isValid, isFalse);
    expect(
      result.errors.any(
        (error) => error.contains('nextNodeId'),
      ),
      isTrue,
    );
  });
}
