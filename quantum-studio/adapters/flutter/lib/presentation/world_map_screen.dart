import 'world_map_screen_model.dart';

enum WorldMapActionType {
  openLocation,
  startMission,
  showLockedLocation,
}

class WorldMapAction {
  final WorldMapActionType type;
  final String targetId;

  const WorldMapAction({
    required this.type,
    required this.targetId,
  });
}

class WorldMapScreen {
  final WorldMapScreenModel model;

  const WorldMapScreen({
    required this.model,
  });

  String get title => 'Spark City';

  String get subtitle => 'Explore. Learn. Build your future.';

  String get playerName => model.player.playerName;

  int get sparkCoins => model.player.sparkCoins;

  int get xp => model.player.xp;

  List<WorldMapAction> get actions {
    final result = <WorldMapAction>[];

    for (final location in model.world.locations) {
      result.add(
        WorldMapAction(
          type: location.unlocked
              ? WorldMapActionType.openLocation
              : WorldMapActionType.showLockedLocation,
          targetId: location.id,
        ),
      );
    }

    for (final mission in model.availableMissions) {
      result.add(
        WorldMapAction(
          type: WorldMapActionType.startMission,
          targetId: mission.id,
        ),
      );
    }

    return List.unmodifiable(result);
  }

  WorldMapAction? actionFor(String targetId) {
    for (final action in actions) {
      if (action.targetId == targetId) {
        return action;
      }
    }

    return null;
  }
}
