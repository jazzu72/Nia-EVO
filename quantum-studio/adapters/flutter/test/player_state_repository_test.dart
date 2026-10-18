import 'package:test/test.dart';

import '../lib/domain/player_state_repository.dart';
import '../lib/domain/quantum_events.dart';

void main() {
  test('player state persists with optimistic concurrency', () async {
    final repository = InMemoryPlayerStateRepository();

    const state = WorldState(
      aggregateId: 'player:persistence',
      phase: GamePhase.complete,
      playerResources: {
        'spark_coins': 80,
        'xp': 50,
      },
      skills: {
        'budgeting': 1,
      },
      completedMissions: [
        'MMQ-003',
      ],
    );

    await repository.save(state, 0);

    final loaded = await repository.load(
      'player:persistence',
    );

    expect(loaded, isNotNull);
    expect(
      loaded!.playerResources['spark_coins'],
      80,
    );
    expect(
      loaded.playerResources['xp'],
      50,
    );
    expect(
      loaded.skills['budgeting'],
      1,
    );
    expect(
      loaded.completedMissions,
      contains('MMQ-003'),
    );

    expect(
      await repository.version('player:persistence'),
      1,
    );
  });

  test('stale writes are rejected', () async {
    final repository = InMemoryPlayerStateRepository();

    const state = WorldState(
      aggregateId: 'player:conflict',
      phase: GamePhase.complete,
    );

    await repository.save(state, 0);

    expect(
      () => repository.save(state, 0),
      throwsA(isA<StateError>()),
    );
  });
}
