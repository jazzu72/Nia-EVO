import 'dart:convert';
import 'dart:io';

import 'scenario_rules.dart';
import 'scenario_rules_loader.dart';

class ScenarioRulesRepository {
  final ScenarioRulesLoader loader;
  final String worldPath;

  const ScenarioRulesRepository({
    this.loader = const ScenarioRulesLoader(),
    this.worldPath = 'quantum-studio/worlds/money-munchkins/world.json',
  });

  ScenarioRules load() {
    final source = File(worldPath).readAsStringSync();
    final world = jsonDecode(source);

    if (world is! Map<String, dynamic>) {
      throw const FormatException('INVALID_WORLD_JSON');
    }

    final rawRules = world['scenarioRules'];

    if (rawRules is! Map) {
      throw const FormatException('SCENARIO_RULES_MISSING');
    }

    return loader.fromJson(
      Map<String, dynamic>.from(rawRules),
    );
  }
}
