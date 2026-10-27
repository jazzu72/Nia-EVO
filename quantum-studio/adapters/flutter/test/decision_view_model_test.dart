import 'package:test/test.dart';

import '../lib/presentation/decision_view_model.dart';

void main() {
  test('decision view model exposes safe player choices', () {
    const view = DecisionViewModel(
      nodeId: 'node_budget_choice',
      prompt: 'What will you do with your available Spark Coins?',
      reflectionPrompt: 'What did your choice teach you?',
      options: [
        DecisionOptionViewModel(
          id: 'opt_save',
          label: 'Save for later',
          description: 'Keep your coins for a future goal.',
          enabled: true,
        ),
        DecisionOptionViewModel(
          id: 'opt_spend',
          label: 'Spend now',
          description: 'Use your coins for something you want.',
          enabled: true,
        ),
      ],
    );

    expect(
      view.nodeId,
      'node_budget_choice',
    );
    expect(
      view.options.length,
      2,
    );
    expect(
      view.canChoose('opt_save'),
      isTrue,
    );
    expect(
      view.canChoose('opt_spend'),
      isTrue,
    );
    expect(
      view.canChoose('invalid'),
      isFalse,
    );
    expect(
      view.option('opt_save')!.label,
      'Save for later',
    );
    expect(
      view.reflectionPrompt,
      isNotNull,
    );
  });

  test('disabled decisions cannot be selected', () {
    const view = DecisionViewModel(
      nodeId: 'node_budget_choice',
      prompt: 'Choose wisely.',
      options: [
        DecisionOptionViewModel(
          id: 'opt_save',
          label: 'Save',
          description: 'Save your coins.',
          enabled: false,
        ),
      ],
    );

    expect(
      view.canChoose('opt_save'),
      isFalse,
    );
  });
}
