import 'package:test/test.dart';

import '../lib/domain/game_command.dart';

void main() {
  test('typed commands preserve command intent', () {
    const start = GameCommand.start('MMQ-003');
    const explore = GameCommand.explore();
    const plan = GameCommand.plan();
    const confirm = GameCommand.confirmPlan();

    const decide = GameCommand.decide(
      'MMQ-003',
      'opt_save',
      seed: 42,
    );

    expect(start, isA<StartMission>());
    expect((start as StartMission).missionId, 'MMQ-003');

    expect(explore, isA<Explore>());
    expect(plan, isA<Plan>());
    expect(confirm, isA<ConfirmPlan>());

    expect(decide, isA<Decide>());
    expect((decide as Decide).missionId, 'MMQ-003');
    expect(decide.optionId, 'opt_save');
    expect(decide.seed, 42);
  });
}
