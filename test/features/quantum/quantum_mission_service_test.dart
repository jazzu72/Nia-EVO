import 'dart:io';
import 'package:test/test.dart';
import 'package:nia_capital_os/features/quantum/services/quantum_mission_service.dart';
import 'package:nia_capital_os/features/quantum/models/quantum_mission_status.dart';
import 'package:nia_capital_os/features/quantum/state/quantum_player_state.dart';
import 'package:nia_capital_os/features/quantum/api/quantum_dashboard_api.dart';

void main() {
  test('mission service validates and runs a complete mission', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final validation = service.validateMission(
      startNodeId: 'start-001',
    );

    expect(validation.isValid, isTrue);
    expect(
      validation.visitedNodes,
      containsAll(<String>[
        'start-001',
        'node-002',
        'node-003',
      ]),
    );

    final runner = service.start(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
        sparkCoins: 20,
      ),
    );

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: service.nodePath('start-001'),
      choiceId: 'choice-save',
    );

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: service.nodePath('node-002'),
      choiceId: 'choice-plan',
    );

    runner.choose(
      missionId: 'mission-bike-savings',
      nodePath: service.nodePath('node-003'),
      choiceId: 'choice-budget',
    );

    expect(runner.player.currentNodeId, 'mission-complete');
    expect(runner.player.sparkCoins, 55);
    expect(runner.player.xp, 50);
    expect(
      runner.player.completedNodes,
      contains('mission-bike-savings'),
    );
    expect(runner.transactionHistory.length, 3);
    expect(runner.branchHistory.length, 3);
  });
  test('mission service loads the mission catalog', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final catalog = service.loadAvailableMissions();

    expect(catalog, isNotEmpty);
    expect(
      catalog.any((mission) => mission.startNodeId == 'start-001'),
      isTrue,
    );
    expect(
      catalog.every((mission) => mission.missionId.isNotEmpty),
      isTrue,
    );
  });

  test('mission service safely finds missing missions', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    expect(service.findMission('start-001'), isNotNull);
    expect(service.findMission('does-not-exist'), isNull);
  });

  test('mission service reports mission status', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
    );

    expect(
      service.missionStatus(
        player: player,
        missionId: 'mission-bike-savings',
      ),
      QuantumMissionStatus.available,
    );

    player.completedNodes.add('mission-bike-savings');

    expect(
      service.missionStatus(
        player: player,
        missionId: 'mission-bike-savings',
      ),
      QuantumMissionStatus.completed,
    );
  });

  test('mission service builds mission cards', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final cards = service.missionCards(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
      ),
    );

    expect(cards, isNotEmpty);
    expect(cards.first.mission.startNodeId, 'start-001');
    expect(
      cards.first.status,
      QuantumMissionStatus.available,
    );
  });

  test('mission cards serialize for UI consumption', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final cards = service.missionCards(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
      ),
    );

    final json = cards.first.toJson();

    expect(json['status'], 'available');
    expect(json['mission'], isA<Map<String, dynamic>>());

    final mission = json['mission'] as Map<String, dynamic>;

    expect(mission['startNodeId'], 'start-001');
    expect(mission['missionId'], isNotEmpty);
  });

  test('mission service builds dashboard snapshot', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final snapshot = service.dashboardSnapshot(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
        sparkCoins: 20,
        xp: 10,
      ),
    );

    expect(snapshot.playerId, 'pilot-001');
    expect(snapshot.currentNodeId, 'start-001');
    expect(snapshot.sparkCoins, 20);
    expect(snapshot.xp, 10);
    expect(snapshot.completedMissions, isEmpty);
    expect(snapshot.missions, isNotEmpty);
  });

  test('dashboard snapshot is immutable', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final snapshot = service.dashboardSnapshot(
      player: QuantumPlayerState(
        playerId: 'pilot-001',
        currentNodeId: 'start-001',
        sparkCoins: 20,
      ),
    );

    expect(snapshot.sparkCoins, 20);
    expect(snapshot.toJson()['sparkCoins'], 20);
  });

  test('mission service loads mission metadata', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final mission = service.loadMission('start-001');

    expect(mission.startNodeId, 'start-001');
    expect(mission.missionId, isNotEmpty);
    expect(mission.learningObjective, isNotEmpty);
  });

  test('mission service discovers available missions', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final missions = service.availableMissions();

    expect(missions, contains('start-001'));
    expect(missions, isNotEmpty);
  });

  test('mission service validates all discovered mission graphs', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final result = service.validateAllMissions();

    expect(result.isValid, isTrue);
    expect(result.errors, isEmpty);
    expect(result.visitedNodes, contains('start-001'));
    expect(result.visitedNodes, contains('node-002'));
    expect(result.visitedNodes, contains('node-003'));
  });

  test('mission service launch validates and starts a mission', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'idle',
      sparkCoins: 20,
    );

    final runner = service.launch(
      player: player,
      missionId: 'start-001',
    );

    expect(runner.player.currentNodeId, 'start-001');
    expect(runner.sparkCoinBalance, 20);
  });

  test('mission service launch rejects unknown missions', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'idle',
      sparkCoins: 20,
    );

    expect(
      () => service.launch(
        player: player,
        missionId: 'start-999',
      ),
      throwsA(isA<StateError>()),
    );

    expect(player.currentNodeId, 'idle');
  });

  test('mission service launch rejects an invalid mission graph', () {
    final temp = Directory.systemTemp.createTempSync('nia-quantum-invalid-');
    final missions = Directory('${temp.path}/missions')..createSync();

    File('${missions.path}/start-001.json').writeAsStringSync('''
{
  "nodeId": "start-001",
  "missionId": "start-001",
  "choices": [
    {
      "choiceId": "bad-choice",
      "outcomeId": "missing-outcome"
    }
  ],
  "outcomes": []
}
''');

    final service = QuantumMissionService(
      missionDirectory: missions.path,
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'idle',
      sparkCoins: 20,
    );

    expect(
      () => service.launch(
        player: player,
        missionId: 'start-001',
      ),
      throwsA(isA<StateError>()),
    );

    expect(player.currentNodeId, 'idle');
    temp.deleteSync(recursive: true);
  });

  test('mission service launch rejects an already completed mission', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'mission-complete',
      sparkCoins: 75,
      completedNodes: ['start-001'],
    );

    expect(
      () => service.launch(
        player: player,
        missionId: 'start-001',
      ),
      throwsA(isA<StateError>()),
    );

    expect(player.currentNodeId, 'mission-complete');
  });

  test('mission service launch rejects a player already in another mission',
      () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'node-002',
      sparkCoins: 30,
    );

    expect(
      () => service.launch(
        player: player,
        missionId: 'start-001',
      ),
      throwsA(isA<StateError>()),
    );

    expect(player.currentNodeId, 'node-002');
  });

  test('mission service resetPlayer restores a clean player state', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'node-003',
      sparkCoins: 55,
      xp: 90,
      completedNodes: ['start-001'],
    );

    service.resetPlayer(
      player: player,
      startingSparkCoins: 20,
    );

    expect(player.playerId, 'pilot-001');
    expect(player.currentNodeId, 'idle');
    expect(player.sparkCoins, 20);
    expect(player.xp, 0);
    expect(player.completedNodes, isEmpty);
  });

  test('mission service returns only launchable missions', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'idle',
      sparkCoins: 20,
      completedNodes: ['start-001'],
    );

    final missions = service.loadLaunchableMissions(
      player: player,
    );

    expect(
      missions.any((mission) => mission.missionId == 'start-001'),
      isFalse,
    );
  });

  test('mission service returns the current mission card', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final card = service.currentMissionCard(
      player: player,
    );

    expect(card, isNotNull);
    expect(card!.mission.missionId, 'mission-bike-savings');
    expect(card.status, QuantumMissionStatus.available);
  });

  test('dashboard snapshot exposes the current mission', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final snapshot = service.dashboardSnapshot(
      player: player,
    );

    expect(snapshot.currentMission, isNotNull);
    expect(
      snapshot.currentMission!.mission.missionId,
      'mission-bike-savings',
    );
    expect(
      snapshot.toJson()['currentMission']['mission']['missionId'],
      'mission-bike-savings',
    );
  });

  test('dashboard snapshot returns null current mission when player is idle',
      () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'idle',
      sparkCoins: 20,
    );

    final snapshot = service.dashboardSnapshot(
      player: player,
    );

    expect(snapshot.currentMission, isNull);
    expect(snapshot.toJson()['currentMission'], isNull);
  });

  test('dashboard snapshot clears current mission after completion', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'mission-complete',
      sparkCoins: 75,
      xp: 50,
      completedNodes: ['mission-bike-savings'],
    );

    final snapshot = service.dashboardSnapshot(
      player: player,
    );

    expect(snapshot.currentMission, isNull);
    expect(snapshot.completedMissions, contains('mission-bike-savings'));
    expect(snapshot.toJson()['currentMission'], isNull);
  });

  test('dashboard API returns the typed quantum snapshot', () {
    final service = QuantumMissionService(
      missionDirectory: 'lib/features/quantum/data/missions',
    );
    final api = QuantumDashboardApi(service: service);

    final player = QuantumPlayerState(
      playerId: 'pilot-001',
      currentNodeId: 'start-001',
      sparkCoins: 20,
    );

    final snapshot = api.snapshotModel(player: player);
    final json = api.snapshot(player: player);

    expect(snapshot.playerId, 'pilot-001');
    expect(snapshot.sparkCoins, 20);
    expect(snapshot.currentMission, isNotNull);
    expect(json['playerId'], 'pilot-001');
    expect(json['sparkCoins'], 20);
  });
}
