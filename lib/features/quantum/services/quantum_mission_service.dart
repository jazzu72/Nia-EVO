import 'dart:io';

import '../engine/quantum_branching_engine.dart';
import '../models/quantum_mission.dart';
import '../models/quantum_mission_status.dart';
import '../models/quantum_mission_card.dart';
import '../models/quantum_dashboard_snapshot.dart';
import '../validation/quantum_mission_graph_validator.dart';
import '../state/quantum_player_state.dart';
import 'quantum_mission_completion.dart';
import 'quantum_mission_session_runner.dart';
import 'quantum_mission_session.dart';

class QuantumMissionService {
  final String missionDirectory;
  final QuantumBranchingEngine engine;

  QuantumMissionService({
    required this.missionDirectory,
    QuantumBranchingEngine? engine,
  }) : engine = engine ?? QuantumBranchingEngine();

  QuantumMissionSessionRunner launch({
    required QuantumPlayerState player,
    required String missionId,
  }) {
    if (player.completedNodes.contains(missionId) ||
        QuantumMissionCompletion.isComplete(player.currentNodeId)) {
      throw StateError(
        'Mission "$missionId" has already been completed.',
      );
    }

    if (player.currentNodeId != 'idle' &&
        player.currentNodeId != missionId &&
        !player.currentNodeId.startsWith('start-')) {
      throw StateError(
        'Player is already in an active mission at node '
        '"${player.currentNodeId}".',
      );
    }

    final validation = validateMission(startNodeId: missionId);

    if (!validation.isValid) {
      throw StateError(
        'Mission "$missionId" failed validation: '
        '${validation.errors.join(' | ')}',
      );
    }

    if (!nodeExists(missionId)) {
      throw StateError('Mission "$missionId" does not exist.');
    }

    player.currentNodeId = missionId;

    return start(player: player);
  }

  void resetPlayer({
    required QuantumPlayerState player,
    int startingSparkCoins = 0,
  }) {
    player.currentNodeId = 'idle';
    player.sparkCoins = startingSparkCoins;
    player.xp = 0;
    player.completedNodes.clear();
  }

  QuantumMissionSessionRunner start({
    required QuantumPlayerState player,
  }) {
    return QuantumMissionSessionRunner(
      player: player,
      engine: engine,
    );
  }

  QuantumMissionGraphValidationResult validateMission({
    required String startNodeId,
  }) {
    return const QuantumMissionGraphValidator().validate(
      startNodePath: '$missionDirectory/$startNodeId.json',
      missionDirectory: missionDirectory,
    );
  }

  String nodePath(String nodeId) {
    return '$missionDirectory/$nodeId.json';
  }

  List<String> availableMissions() {
    final directory = Directory(missionDirectory);

    if (!directory.existsSync()) {
      return const [];
    }

    return directory
        .listSync()
        .whereType<File>()
        .where((file) => file.path.endsWith('.json'))
        .map((file) => file.uri.pathSegments.last.replaceFirst('.json', ''))
        .where((id) => id.startsWith('start-'))
        .toList()
      ..sort();
  }

  QuantumMissionGraphValidationResult validateAllMissions() {
    final errors = <String>[];

    for (final missionId in availableMissions()) {
      final result = validateMission(startNodeId: missionId);

      if (!result.isValid) {
        errors.addAll(
          result.errors.map(
            (error) => '$missionId: $error',
          ),
        );
      }
    }

    return QuantumMissionGraphValidationResult(
      isValid: errors.isEmpty,
      errors: List.unmodifiable(errors),
      visitedNodes: List.unmodifiable(
        availableMissions()
            .expand(
              (missionId) => validateMission(
                startNodeId: missionId,
              ).visitedNodes,
            )
            .toSet()
            .toList(),
      ),
    );
  }

  List<QuantumMission> loadLaunchableMissions({
    required QuantumPlayerState player,
  }) {
    return loadAvailableMissions().where((mission) {
      if (player.completedNodes.contains(mission.missionId)) {
        return false;
      }

      return validateMission(
        startNodeId: mission.startNodeId,
      ).isValid;
    }).toList(growable: false);
  }

  QuantumMissionCard? currentMissionCard({
    required QuantumPlayerState player,
  }) {
    final missions = loadAvailableMissions();

    QuantumMission? current;

    for (final mission in missions) {
      if (mission.startNodeId == player.currentNodeId ||
          mission.missionId == player.currentNodeId) {
        current = mission;
        break;
      }

      final graph = validateMission(
        startNodeId: mission.startNodeId,
      );

      if (graph.visitedNodes.contains(player.currentNodeId)) {
        current = mission;
        break;
      }
    }

    if (current == null) {
      return null;
    }

    return QuantumMissionCard(
      mission: current,
      status: missionStatus(
        player: player,
        missionId: current.missionId,
      ),
    );
  }

  bool nodeExists(String nodeId) {
    return File(nodePath(nodeId)).existsSync();
  }

  List<QuantumMission> loadAvailableMissions() {
    return availableMissions().map(loadMission).toList(growable: false);
  }

  QuantumMissionStatus missionStatus({
    required QuantumPlayerState player,
    required String missionId,
  }) {
    if (player.completedNodes.contains(missionId) ||
        QuantumMissionCompletion.isComplete(player.currentNodeId)) {
      return QuantumMissionStatus.completed;
    }

    if (player.currentNodeId == 'start-001') {
      return QuantumMissionStatus.available;
    }

    return QuantumMissionStatus.inProgress;
  }

  QuantumMission? findMission(String startNodeId) {
    if (!nodeExists(startNodeId)) {
      return null;
    }

    return loadMission(startNodeId);
  }

  QuantumDashboardSnapshot dashboardSnapshot({
    required QuantumPlayerState player,
  }) {
    return QuantumDashboardSnapshot(
      playerId: player.playerId,
      currentNodeId: player.currentNodeId,
      sparkCoins: player.sparkCoins,
      xp: player.xp,
      completedMissions: List<String>.unmodifiable(
        player.completedNodes,
      ),
      missions: List<QuantumMissionCard>.unmodifiable(
        missionCards(player: player),
      ),
      currentMission: currentMissionCard(player: player),
    );
  }

  List<QuantumMissionCard> missionCards({
    required QuantumPlayerState player,
  }) {
    return loadAvailableMissions()
        .map(
          (mission) => QuantumMissionCard(
            mission: mission,
            status: missionStatus(
              player: player,
              missionId: mission.missionId,
            ),
          ),
        )
        .toList(growable: false);
  }

  QuantumMission loadMission(String startNodeId) {
    final node = engine.loadNode(nodePath(startNodeId));

    return QuantumMission(
      missionId: node['missionId'] as String? ?? startNodeId,
      startNodeId: node['nodeId'] as String? ?? startNodeId,
      title: node['title'] as String? ?? startNodeId,
      learningObjective: node['learningObjective'] as String? ?? '',
    );
  }

  Future<QuantumMissionSession> loadSession(String path) {
    return QuantumMissionSession.load(path);
  }
}
