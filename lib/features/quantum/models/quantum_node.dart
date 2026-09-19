class QuantumNode {
  final String nodeId;
  final String missionId;
  final int version;
  final String narrative;
  final String learningObjective;

  final List<QuantumChoice> choices;
  final List<QuantumCondition> conditions;
  final List<QuantumOutcome> outcomes;

  final int rewards;
  final int penalties;
  final List<String> nextNodes;

  const QuantumNode({
    required this.nodeId,
    required this.missionId,
    required this.version,
    required this.narrative,
    required this.learningObjective,
    required this.choices,
    required this.conditions,
    required this.outcomes,
    required this.rewards,
    required this.penalties,
    required this.nextNodes,
  });

  factory QuantumNode.fromJson(Map<String, dynamic> json) {
    return QuantumNode(
      nodeId: json['nodeId'] as String,
      missionId: json['missionId'] as String,
      version: json['version'] as int,
      narrative: json['narrative'] as String,
      learningObjective: json['learningObjective'] as String,
      choices: (json['choices'] as List<dynamic>? ?? [])
          .map(
            (choice) => QuantumChoice.fromJson(
              Map<String, dynamic>.from(choice as Map),
            ),
          )
          .toList(),
      conditions: (json['conditions'] as List<dynamic>? ?? [])
          .map(
            (condition) => QuantumCondition.fromJson(
              Map<String, dynamic>.from(condition as Map),
            ),
          )
          .toList(),
      outcomes: (json['outcomes'] as List<dynamic>? ?? [])
          .map(
            (outcome) => QuantumOutcome.fromJson(
              Map<String, dynamic>.from(outcome as Map),
            ),
          )
          .toList(),
      rewards: json['rewards'] as int? ?? 0,
      penalties: json['penalties'] as int? ?? 0,
      nextNodes: (json['nextNodes'] as List<dynamic>? ?? [])
          .map((node) => node.toString())
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nodeId': nodeId,
      'missionId': missionId,
      'version': version,
      'narrative': narrative,
      'learningObjective': learningObjective,
      'choices': choices.map((choice) => choice.toJson()).toList(),
      'conditions': conditions.map((condition) => condition.toJson()).toList(),
      'outcomes': outcomes.map((outcome) => outcome.toJson()).toList(),
      'rewards': rewards,
      'penalties': penalties,
      'nextNodes': nextNodes,
    };
  }
}

class QuantumChoice {
  final String choiceId;
  final String description;
  final List<QuantumCondition> conditions;
  final String outcomeId;

  const QuantumChoice({
    required this.choiceId,
    required this.description,
    required this.conditions,
    required this.outcomeId,
  });

  factory QuantumChoice.fromJson(Map<String, dynamic> json) {
    return QuantumChoice(
      choiceId: json['choiceId'] as String,
      description: json['description'] as String,
      conditions: (json['conditions'] as List<dynamic>? ?? [])
          .map(
            (condition) => QuantumCondition.fromJson(
              Map<String, dynamic>.from(condition as Map),
            ),
          )
          .toList(),
      outcomeId: json['outcomeId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'choiceId': choiceId,
      'description': description,
      'conditions': conditions.map((condition) => condition.toJson()).toList(),
      'outcomeId': outcomeId,
    };
  }
}

class QuantumCondition {
  final String key;
  final String operator;
  final dynamic value;

  const QuantumCondition({
    required this.key,
    required this.operator,
    required this.value,
  });

  factory QuantumCondition.fromJson(Map<String, dynamic> json) {
    return QuantumCondition(
      key: json['key'] as String,
      operator: json['operator'] as String,
      value: json['value'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'key': key, 'operator': operator, 'value': value};
  }
}

class QuantumOutcome {
  final String outcomeId;
  final String description;
  final int rewards;
  final int penalties;
  final String nextNodeId;

  const QuantumOutcome({
    required this.outcomeId,
    required this.description,
    required this.rewards,
    required this.penalties,
    required this.nextNodeId,
  });

  factory QuantumOutcome.fromJson(Map<String, dynamic> json) {
    return QuantumOutcome(
      outcomeId: json['outcomeId'] as String,
      description: json['description'] as String,
      rewards: json['rewards'] as int? ?? 0,
      penalties: json['penalties'] as int? ?? 0,
      nextNodeId: json['nextNodeId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'outcomeId': outcomeId,
      'description': description,
      'rewards': rewards,
      'penalties': penalties,
      'nextNodeId': nextNodeId,
    };
  }
}
