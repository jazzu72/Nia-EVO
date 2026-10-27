import 'dart:convert';

import 'scenario_rules.dart';

class ScenarioRulesLoader {
  const ScenarioRulesLoader();

  ScenarioRules fromJsonString(String source) {
    final decoded = jsonDecode(source);

    if (decoded is! Map<String, dynamic>) {
      throw const FormatException(
        'INVALID_SCENARIO_RULES_JSON',
      );
    }

    return ScenarioRules.fromJson(decoded);
  }

  ScenarioRules fromJson(Map<String, dynamic> json) {
    return ScenarioRules.fromJson(json);
  }
}
