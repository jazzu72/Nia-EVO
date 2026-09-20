import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';

import '../../../lib/features/quantum/engine/quantum_branching_engine.dart';

void main() {
  final engine = QuantumBranchingEngine();

  final missionPath = 'lib/features/quantum/data/missions/start-001.json';

  group('Quantum Branching Engine', () {
    late Map<String, dynamic> node;

    setUp(() {
      final file = File(missionPath);
      node = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
    });

    test('loads the starting QuantumNode', () {
      expect(node['nodeId'], equals('start-001'));
      expect(node['missionId'], equals('mission-bike-savings'));
      expect(node['learningObjective'], equals('SAVING'));
    });

    test('save branch awards 10 Spark Coins', () {
      final result = engine.evaluate(node: node, choiceId: 'choice-save');

      expect(result.choiceId, equals('choice-save'));
      expect(result.outcomeId, equals('outcome-save'));
      expect(result.sparkCoinDelta, equals(10));
      expect(result.nextNodeId, equals('node-002'));
    });

    test('spend branch applies 5 Spark Coin penalty', () {
      final result = engine.evaluate(node: node, choiceId: 'choice-spend');

      expect(result.choiceId, equals('choice-spend'));
      expect(result.outcomeId, equals('outcome-spend'));
      expect(result.sparkCoinDelta, equals(-5));
      expect(result.nextNodeId, equals('node-002'));
    });

    test('invalid choice is rejected', () {
      expect(
        () => engine.evaluate(node: node, choiceId: 'invalid-choice'),
        throwsStateError,
      );
    });
  });
}
