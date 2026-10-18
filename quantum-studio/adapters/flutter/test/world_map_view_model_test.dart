import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/presentation/world_map_view_model.dart';

void main() {
  test('world map projects Spark City locations', () {
    const state = WorldState(
      aggregateId: 'player:map',
      phase: GamePhase.briefing,
      unlockedLocations: [
        'loc_market_district',
        'loc_savings_station',
      ],
    );

    final map = WorldMapViewModel.fromState(state);

    expect(
      map.worldName,
      'Money Munchkins: Quantum Odyssey',
    );
    expect(map.locations.length, 4);
    expect(map.unlocked.length, 2);
    expect(map.locked.length, 2);

    final market = map.location('loc_market_district');

    expect(market, isNotNull);
    expect(market!.unlocked, isTrue);

    final lab = map.location('loc_quantum_lab');

    expect(lab, isNotNull);
    expect(lab!.unlocked, isFalse);
  });
}
