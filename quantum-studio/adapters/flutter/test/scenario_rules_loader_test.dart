import 'package:test/test.dart';

import '../lib/domain/scenario_rules_loader.dart';
import 'dart:convert';
import 'dart:io';

void main() {
  test('loads scenario rules from canonical JSON', () {
    const loader = ScenarioRulesLoader();

    final rules = loader.fromJsonString('''
    {
      "learningSignals": {
        "split_fleet": [
          "DECISION_RECORDED",
          "CONSEQUENCES_APPLIED"
        ]
      },
      "recoveryOptions": {
        "split_fleet": [
          "REFLECT_ON_OUTCOME",
          "TRY_ALTERNATE_PATH"
        ]
      }
    }
    ''');

    expect(
      rules.signalsFor('split_fleet'),
      containsAll([
        'DECISION_RECORDED',
        'CONSEQUENCES_APPLIED',
      ]),
    );

    expect(
      rules.recoveryFor('split_fleet'),
      contains('TRY_ALTERNATE_PATH'),
    );

    expect(rules.encode(), contains('learningSignals'));
  });

  test('canonical Money Munchkins world contains scenario rules', () {
    final source = File(
      'quantum-studio/worlds/money-munchkins/world.json',
    ).readAsStringSync();

    const loader = ScenarioRulesLoader();
    final world = Map<String, dynamic>.from(
      jsonDecode(source) as Map,
    );

    final rules = loader.fromJson(
      Map<String, dynamic>.from(
        world['scenarioRules'] as Map,
      ),
    );

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
