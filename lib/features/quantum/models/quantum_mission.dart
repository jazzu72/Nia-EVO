class QuantumMission {
  final String missionId;
  final String startNodeId;
  final String title;
  final String learningObjective;

  const QuantumMission({
    required this.missionId,
    required this.startNodeId,
    required this.title,
    required this.learningObjective,
  });

  Map<String, dynamic> toJson() => {
        'missionId': missionId,
        'startNodeId': startNodeId,
        'title': title,
        'learningObjective': learningObjective,
      };
}
