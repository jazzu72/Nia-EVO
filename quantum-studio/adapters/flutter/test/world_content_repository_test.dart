import 'package:test/test.dart';

import '../lib/presentation/world_content_repository.dart';

void main() {
  test('canonical Money Munchkins world loads into presentation data', () {
    const repository = WorldContentRepository();

    final world = repository.loadWorld();

    expect(
      world['name'],
      'Money Munchkins: Quantum Odyssey',
    );

    final missions = repository.missions();

    expect(missions.length, 3);
    expect(
      missions.map((mission) => mission.id),
      containsAll([
        'MMQ-001',
        'MMQ-002',
        'MMQ-003',
      ]),
    );

    final mission = repository.mission('MMQ-003');

    expect(mission, isNotNull);
    expect(
      mission!.title,
      'Build Your First Budget',
    );
    expect(
      mission.hasOption('opt_save'),
      isTrue,
    );
  });
}
