import 'package:test/test.dart';

import '../../../lib/features/quantum/validation/quantum_mission_graph_validator.dart';

void main() {
  test('mission graph validates the complete bike savings path', () {
    const validator = QuantumMissionGraphValidator();

    final result = validator.validate(
      startNodePath: 'lib/features/quantum/data/missions/start-001.json',
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    expect(result.isValid, isTrue);
    expect(result.errors, isEmpty);
    expect(result.visitedNodes, contains('start-001'));
    expect(result.visitedNodes, contains('node-002'));
    expect(result.visitedNodes, contains('node-003'));
  });
}
