import '../domain/quantum_events.dart';
import 'mission_view_model.dart';
import 'player_view_model.dart';
import 'world_content_repository.dart';
import 'world_map_view_model.dart';

class WorldMapScreenModel {
  final PlayerViewModel player;
  final WorldMapViewModel world;
  final List<MissionViewModel> missions;

  const WorldMapScreenModel({
    required this.player,
    required this.world,
    required this.missions,
  });

  factory WorldMapScreenModel.fromState(
    WorldState state, {
    String playerName = 'Explorer',
    WorldContentRepository repository = const WorldContentRepository(),
  }) {
    final player = PlayerViewModel.fromState(
      state,
      playerName: playerName,
    );

    final world = repository.worldMap(state);

    final missions = <MissionViewModel>[];

    for (final mission in repository.missions()) {
      final view = repository.missionView(
        id: mission.id,
        state: state,
      );

      if (view != null) {
        missions.add(view);
      }
    }

    return WorldMapScreenModel(
      player: player,
      world: world,
      missions: List.unmodifiable(missions),
    );
  }

  MissionViewModel? mission(String id) {
    for (final mission in missions) {
      if (mission.id == id) return mission;
    }

    return null;
  }

  List<MissionViewModel> get availableMissions =>
      missions.where((mission) => mission.playable).toList();

  List<MissionViewModel> get completedMissions =>
      missions.where((mission) => mission.completed).toList();

  bool get hasPlayableContent =>
      availableMissions.isNotEmpty || world.unlocked.isNotEmpty;
}
