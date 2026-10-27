import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/presentation/world_map_screen.dart';
import '../lib/presentation/world_map_screen_model.dart';

void main() {
  test('Spark City exposes premium player-facing world navigation', () {
    const state = WorldState(
      aggregateId: 'player:ui',
      phase: GamePhase.briefing,
      playerResources: {
        'spark_coins': 50,
        'xp': 0,
      },
      unlockedLocations: [
        'loc_market_district',
      ],
    );

    final screen = WorldMapScreen(
      model: WorldMapScreenModel.fromState(state),
    );

    expect(screen.title, 'Spark City');
    expect(
      screen.subtitle,
      'Explore. Learn. Build your future.',
    );
    expect(screen.playerName, 'Explorer');
    expect(screen.sparkCoins, 50);
    expect(screen.xp, 0);

    final market = screen.actionFor('loc_market_district');

    expect(market, isNotNull);
    expect(
      market!.type,
      WorldMapActionType.openLocation,
    );

    final savings = screen.actionFor('loc_savings_station');

    expect(savings, isNotNull);
    expect(
      savings!.type,
      WorldMapActionType.showLockedLocation,
    );

    final mission = screen.actionFor('MMQ-001');

    expect(mission, isNotNull);
    expect(
      mission!.type,
      WorldMapActionType.startMission,
    );
  });

  test('completed missions are removed from start actions', () {
    const state = WorldState(
      aggregateId: 'player:ui-complete',
      phase: GamePhase.complete,
      playerResources: {
        'spark_coins': 60,
        'xp': 10,
      },
      completedMissions: [
        'MMQ-001',
      ],
      unlockedLocations: [
        'loc_market_district',
      ],
    );

    final screen = WorldMapScreen(
      model: WorldMapScreenModel.fromState(state),
    );

    expect(
      screen.actionFor('MMQ-001'),
      isNull,
    );

    expect(
      screen.actionFor('MMQ-002')!.type,
      WorldMapActionType.startMission,
    );
  });
}
