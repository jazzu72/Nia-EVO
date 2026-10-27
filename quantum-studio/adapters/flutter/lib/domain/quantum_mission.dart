class QuantumMission {
  final String id;
  final String title;
  final List<String> optionIds;

  const QuantumMission({
    required this.id,
    required this.title,
    required this.optionIds,
  });

  bool hasOption(String optionId) {
    return optionIds.contains(optionId);
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'optionIds': optionIds,
      };

  factory QuantumMission.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['optionIds'];

    return QuantumMission(
      id: json['id'] as String,
      title: json['title'] as String,
      optionIds: rawOptions is List
          ? rawOptions.map((item) => item.toString()).toList()
          : const [],
    );
  }
}
