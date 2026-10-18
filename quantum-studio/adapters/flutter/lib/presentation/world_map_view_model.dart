import '../domain/quantum_events.dart';

class WorldMapLocation {
  final String id;
  final String name;
  final String subtitle;
  final bool unlocked;
  final String destination;

  const WorldMapLocation({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.unlocked,
    required this.destination,
  });
}

class WorldMapViewModel {
  final String worldName;
  final List<WorldMapLocation> locations;

  const WorldMapViewModel({
    required this.worldName,
    required this.locations,
  });

  factory WorldMapViewModel.fromState(
    WorldState state,
  ) {
    const definitions = [
      (
        id: 'loc_market_district',
        name: 'Market District',
        subtitle: 'Discover how money moves.',
      ),
      (
        id: 'loc_savings_station',
        name: 'Savings Station',
        subtitle: 'Turn small choices into big goals.',
      ),
      (
        id: 'loc_builders_workshop',
        name: 'Builder’s Workshop',
        subtitle: 'Plan, build, and create.',
      ),
      (
        id: 'loc_quantum_lab',
        name: 'Quantum Lab',
        subtitle: 'Explore what your choices can change.',
      ),
    ];

    return WorldMapViewModel(
      worldName: 'Money Munchkins: Quantum Odyssey',
      locations: [
        for (final definition in definitions)
          WorldMapLocation(
            id: definition.id,
            name: definition.name,
            subtitle: definition.subtitle,
            unlocked: state.unlockedLocations.contains(definition.id),
            destination: definition.id,
          ),
      ],
    );
  }

  WorldMapLocation? location(String id) {
    for (final location in locations) {
      if (location.id == id) return location;
    }
    return null;
  }

  List<WorldMapLocation> get unlocked =>
      locations.where((location) => location.unlocked).toList();

  List<WorldMapLocation> get locked =>
      locations.where((location) => !location.unlocked).toList();
}
