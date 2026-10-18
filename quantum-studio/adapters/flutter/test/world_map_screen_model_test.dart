import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/presentation/world_map_screen_model.dart';

void main() {
  test('world map screen model assembles canonical player experience', () {
    const state = WorldState(
      aggregateId: 'player:screen',
      phase: GamePhase.briefing,
      playerResources: {
        'spark_coins': 50,
        'xp': 0,
      },
      skills: {
        'saving': 0,
      },
      unlockedLocations: [
        'loc_market_district',
      ],
    );

    final screen = WorldMapScreenModel.fromState(state);

    expect(
      screen.player.sparkCoins,
      50,
    );

    expect(
      screen.world.locations.length,
      4,
    );

    expect(
      screen.world
          .location(
            'loc_market_district',
          )!
          .unlocked,
      isTrue,
    );

    expect(
      screen.missions.length,
      3,
    );

    expect(
      screen.availableMissions.length,
      3,
    );

    expect(
      screen.mission('MMQ-003')!.title,
      'Build Your First Budget',
    );

    expect(
      screen.hasPlayableContent,
      isTrue,
    );
  });

  test('completed mission is reflected in screen model', () {
    const state = WorldState(
      aggregateId: 'player:completed',
      phase: GamePhase.complete,
      playerResources: {
        'spark_coins': 80,
        'xp': 30,
      },
      completedMissions: [
        'MMQ-003',
      ],
      unlockedLocations: [
        'loc_market_district',
      ],
    );

    final screen = WorldMapScreenModel.fromState(state);

    expect(
      screen.mission('MMQ-003')!.completed,
      isTrue,
    );

    expect(
      screen.completedMissions.length,
      1,
    );

    expect(
      screen.availableMissions.length,
      2,
    );
  });
}
