class ScenarioResult {
  final String missionId;
  final String optionId;
  final int seed;
  final List<Map<String, dynamic>> effects;
  final List<String> learningSignals;
  final List<String> recoveryOptions;

  const ScenarioResult({
    required this.missionId,
    required this.optionId,
    required this.seed,
    required this.effects,
    this.learningSignals = const [],
    this.recoveryOptions = const [],
  });

  Map<String, dynamic> toJson() => {
        'missionId': missionId,
        'optionId': optionId,
        'seed': seed,
        'effects': effects,
        'learningSignals': learningSignals,
        'recoveryOptions': recoveryOptions,
      };
}
