import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/presentation/player_view_model.dart';

void main() {
  test('view model projects canonical player state', () {
    const state = WorldState(
      aggregateId: 'player:view',
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
      unlockedLocations: [
        'loc_market_district',
        'loc_savings_station',
      ],
    );

    final view = PlayerViewModel.fromState(
      state,
      playerName: 'Explorer',
    );

    expect(view.playerName, 'Explorer');
    expect(view.sparkCoins, 80);
    expect(view.xp, 50);
    expect(view.skills['budgeting'], 1);
    expect(
      view.isMissionComplete('MMQ-003'),
      isTrue,
    );
    expect(
      view.isLocationUnlocked('loc_savings_station'),
      isTrue,
    );
    expect(view.hasStartedMission, isTrue);
    expect(view.progress, 0.5);
  });
}
