import 'package:test/test.dart';

import '../lib/domain/quantum_events.dart';
import '../lib/domain/quantum_mission.dart';
import '../lib/presentation/mission_view_model.dart';

void main() {
  test('mission view model projects player-facing mission data', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: [
        'opt_save',
        'opt_spend',
      ],
    );

    const state = WorldState(
      aggregateId: 'player:mission-view',
      phase: GamePhase.planning,
    );

    final view = MissionViewModel.fromMission(
      mission: mission,
      state: state,
      description: 'Build a budget and decide what to do with your money.',
      skill: 'budgeting',
      difficulty: 2,
      sparkCoins: 30,
      xp: 30,
    );

    expect(view.id, 'MMQ-003');
    expect(
      view.title,
      'Build Your First Budget',
    );
    expect(view.skill, 'budgeting');
    expect(view.difficulty, 2);
    expect(view.reward.sparkCoins, 30);
    expect(view.reward.xp, 30);
    expect(view.optionIds.length, 2);
    expect(view.playable, isTrue);
    expect(view.hasOption('opt_save'), isTrue);
    expect(view.hasOption('unknown'), isFalse);
  });

  test('completed mission is not playable', () {
    const mission = QuantumMission(
      id: 'MMQ-003',
      title: 'Build Your First Budget',
      optionIds: ['opt_save'],
    );

    const state = WorldState(
      aggregateId: 'player:completed',
      phase: GamePhase.complete,
      completedMissions: ['MMQ-003'],
    );

    final view = MissionViewModel.fromMission(
      mission: mission,
      state: state,
      sparkCoins: 30,
      xp: 30,
    );

    expect(view.completed, isTrue);
    expect(view.playable, isFalse);
  });
}
