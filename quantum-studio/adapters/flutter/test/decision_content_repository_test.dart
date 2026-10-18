import 'package:test/test.dart';

import '../lib/presentation/decision_content_repository.dart';

void main() {
  test('canonical world exposes the budget decision', () {
    const repository = DecisionContentRepository();

    final decision = repository.decision('node_budget_choice');

    expect(decision, isNotNull);
    expect(
      decision!.prompt,
      contains('Spark Coins'),
    );

    expect(
      decision.options.length,
      2,
    );

    expect(
      decision.canChoose('opt_save'),
      isTrue,
    );

    expect(
      decision.canChoose('opt_spend'),
      isTrue,
    );

    expect(
      decision.option('opt_save')!.label,
      isNotEmpty,
    );

    expect(
      decision.option('opt_spend')!.label,
      isNotEmpty,
    );

    expect(
      decision.reflectionPrompt,
      isNotNull,
    );
  });

  test('unknown decision returns null', () {
    const repository = DecisionContentRepository();

    expect(
      repository.decision('missing_node'),
      isNull,
    );
  });
}
