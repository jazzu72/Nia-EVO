import 'package:test/test.dart';

import '../lib/domain/mission_completion.dart';
import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_mission.dart';

void main() {
  test('mission completion returns a completed transition', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save', 'opt_spend'],
    );

    const state = WorldState(
      aggregateId: 'player:complete',
      phase: GamePhase.reflecting,
      playerResources: {
        'spark_coins': 50,
        'xp': 20,
      },
    );

    final transition = const MissionCompletion().complete(
      mission: mission,
      state: state,
      sparkCoins: 30,
      xp: 30,
      skill: 'budgeting',
    );

    expect(
      transition.state.phase,
      GamePhase.complete,
    );
    expect(
      transition.state.completedMissions,
      contains('MMQ-003'),
    );
    expect(
      transition.state.playerResources['spark_coins'],
      80,
    );
    expect(
      transition.state.playerResources['xp'],
      50,
    );
    expect(
      transition.state.skills['budgeting'],
      1,
    );
  });
}
