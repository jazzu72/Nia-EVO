import 'package:test/test.dart';

import '../lib/domain/quantum_mission.dart';

void main() {
  test('mission validates available options', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: [
        'opt_save',
        'opt_spend',
      ],
    );

    expect(mission.hasOption('opt_save'), isTrue);
    expect(mission.hasOption('opt_spend'), isTrue);
    expect(mission.hasOption('invalid_option'), isFalse);
  });

  test('mission serializes and restores deterministically', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    final restored = QuantumMission.fromJson(
      mission.toJson(),
    );

    expect(restored.id, mission.id);
    expect(restored.title, mission.title);
    expect(restored.optionIds, mission.optionIds);
  });
}
