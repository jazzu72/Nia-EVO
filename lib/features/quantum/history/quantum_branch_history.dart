class QuantumBranchHistoryEntry {
  final String missionId;
  final String nodeId;
  final String choiceId;
  final String outcomeId;
  final int sparkCoinDelta;
  final String nextNodeId;

  const QuantumBranchHistoryEntry({
    required this.missionId,
    required this.nodeId,
    required this.choiceId,
    required this.outcomeId,
    required this.sparkCoinDelta,
    required this.nextNodeId,
  });

  Map<String, dynamic> toJson() => {
        'missionId': missionId,
        'nodeId': nodeId,
        'choiceId': choiceId,
        'outcomeId': outcomeId,
        'sparkCoinDelta': sparkCoinDelta,
        'nextNodeId': nextNodeId,
      };

  factory QuantumBranchHistoryEntry.fromJson(
    Map<String, dynamic> json,
  ) {
    return QuantumBranchHistoryEntry(
      missionId: json['missionId'] as String,
      nodeId: json['nodeId'] as String,
      choiceId: json['choiceId'] as String,
      outcomeId: json['outcomeId'] as String,
      sparkCoinDelta: json['sparkCoinDelta'] as int,
      nextNodeId: json['nextNodeId'] as String,
    );
  }
}

class QuantumBranchHistory {
  final List<QuantumBranchHistoryEntry> _entries = [];

  QuantumBranchHistory();

  List<QuantumBranchHistoryEntry> get entries => List.unmodifiable(_entries);

  void record(QuantumBranchHistoryEntry entry) {
    _entries.add(entry);
  }

  Map<String, dynamic> toJson() => {
        'entries': _entries.map((entry) => entry.toJson()).toList(),
      };

  factory QuantumBranchHistory.fromJson(
    Map<String, dynamic> json,
  ) {
    final history = QuantumBranchHistory();

    final entries = json['entries'] as List<dynamic>? ?? [];

    for (final entry in entries) {
      history.record(
        QuantumBranchHistoryEntry.fromJson(
          Map<String, dynamic>.from(entry as Map),
        ),
      );
    }

    return history;
  }
}
