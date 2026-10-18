import 'package:test/test.dart';

import '../lib/domain/scenario_rules_repository.dart';

void main() {
  test('loads scenario rules from canonical Money Munchkins world', () {
    const repository = ScenarioRulesRepository();

    final rules = repository.load();

    expect(
      rules.signalsFor('opt_save'),
      contains('SAVING_REINFORCED'),
    );

    expect(
      rules.recoveryFor('opt_spend'),
      contains('TRY_ALTERNATE_PATH'),
    );
  });
}
