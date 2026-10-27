import 'dart:convert';
import 'dart:io';

import '../domain/quantum_mission.dart';
import 'mission_view_model.dart';
import 'world_map_view_model.dart';

class WorldContentRepository {
  final String worldPath;

  const WorldContentRepository({
    this.worldPath = 'quantum-studio/worlds/money-munchkins/world.json',
  });

  Map<String, dynamic> loadWorld() {
    final decoded = jsonDecode(File(worldPath).readAsStringSync());

    if (decoded is! Map<String, dynamic>) {
      throw const FormatException(
        'INVALID_WORLD_JSON',
      );
    }

    return decoded;
  }

  List<QuantumMission> missions() {
    final world = loadWorld();
    final raw = world['missions'];

    if (raw is! List) return const [];

    return raw
        .whereType<Map>()
        .map(
          (item) => QuantumMission.fromJson(
            _missionJson(item),
          ),
        )
        .toList();
  }

  QuantumMission? mission(String id) {
    for (final mission in missions()) {
      if (mission.id == id) return mission;
    }

    return null;
  }

  MissionViewModel? missionView({
    required String id,
    required dynamic state,
  }) {
    final selected = mission(id);
    if (selected == null) return null;

    final world = loadWorld();
    final rawMissions = world['missions'];

    if (rawMissions is! List) return null;

    Map<String, dynamic>? rawMission;

    for (final item in rawMissions) {
      if (item is Map && item['id'] == id) {
        rawMission = Map<String, dynamic>.from(item);
        break;
      }
    }

    if (rawMission == null) return null;

    final reward = rawMission['reward'];
    final rewardMap = reward is Map ? Map<String, dynamic>.from(reward) : {};

    return MissionViewModel.fromMission(
      mission: selected,
      state: state,
      description: rawMission['description']?.toString(),
      skill: rawMission['skill']?.toString(),
      difficulty: (rawMission['difficulty'] as num?)?.toInt() ?? 1,
      sparkCoins: (rewardMap['spark_coins'] as num?)?.toInt() ?? 0,
      xp: (rewardMap['xp'] as num?)?.toInt() ?? 0,
    );
  }

  WorldMapViewModel worldMap(dynamic state) {
    return WorldMapViewModel.fromState(state);
  }

  Map<String, dynamic> _missionJson(
    Map<dynamic, dynamic> raw,
  ) {
    final world = loadWorld();
    final decisionNodes = world['decisionNodes'];

    final optionIds = <String>[];

    if (decisionNodes is List) {
      for (final node in decisionNodes) {
        if (node is! Map) continue;

        final options = node['options'];
        if (options is! List) continue;

        for (final option in options) {
          if (option is Map && option['id'] != null) {
            optionIds.add(option['id'].toString());
          }
        }
      }
    }

    return {
      'id': raw['id'].toString(),
      'title': raw['title'].toString(),
      'optionIds': optionIds,
    };
  }
}
