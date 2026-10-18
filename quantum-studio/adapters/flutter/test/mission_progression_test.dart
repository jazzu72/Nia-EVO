import 'package:test/test.dart';

import '../lib/domain/mission_progression.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_mission.dart';

void main() {
  test('mission completion awards rewards and skill progress', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    const initial = WorldState(
      aggregateId: 'player:progression',
      phase: GamePhase.reflecting,
      playerResources: {
        'spark_coins': 50,
        'xp': 20,
      },
    );

    const progression = MissionProgression();

    final result = progression.complete(
      mission: mission,
      state: initial,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(result.phase, GamePhase.complete);
    expect(
      result.completedMissions,
      contains('MMQ-003'),
    );
    expect(
      result.playerResources['spark_coins'],
      80,
    );
    expect(
      result.playerResources['xp'],
      50,
    );
    expect(
      result.skills['budgeting'],
      1,
    );
  });

  test('mission completion is idempotent', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save'],
    );

    const initial = WorldState(
      aggregateId: 'player:idempotent',
      phase: GamePhase.reflecting,
      playerResources: {
        'spark_coins': 50,
      },
      completedMissions: ['MMQ-003'],
    );

    final result = const MissionProgression().complete(
      mission: mission,
      state: initial,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(
      result.completedMissions
          .where(
            (id) => id == 'MMQ-003',
          )
          .length,
      1,
    );
    expect(
      result.playerResources['spark_coins'],
      50,
    );
    expect(
      result.playerResources['xp'],
      isNull,
    );
    expect(
      result.skills['budgeting'],
      isNull,
    );
  });
}
