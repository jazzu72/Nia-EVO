import 'dart:convert';

class ScenarioRules {
  final Map<String, List<String>> learningSignals;
  final Map<String, List<String>> recoveryOptions;

  const ScenarioRules({
    this.learningSignals = const {},
    this.recoveryOptions = const {},
  });

  List<String> signalsFor(String optionId) =>
      List.unmodifiable(learningSignals[optionId] ?? const []);

  List<String> recoveryFor(String optionId) =>
      List.unmodifiable(recoveryOptions[optionId] ?? const []);

  Map<String, dynamic> toJson() => {
        'learningSignals': learningSignals,
        'recoveryOptions': recoveryOptions,
      };

  String encode() => jsonEncode(toJson());

  factory ScenarioRules.fromJson(Map<String, dynamic> json) {
    Map<String, List<String>> parse(dynamic value) {
      if (value is! Map) return const {};

      return value.map(
        (key, value) => MapEntry(
          key.toString(),
          value is List
              ? value.map((item) => item.toString()).toList()
              : <String>[],
        ),
      );
    }

    return ScenarioRules(
      learningSignals: parse(json['learningSignals']),
      recoveryOptions: parse(json['recoveryOptions']),
    );
  }
}
