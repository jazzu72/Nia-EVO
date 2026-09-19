class QuantumPlayerState {
  final String playerId;
  String currentNodeId;
  int sparkCoins;
  int xp;
  final List<String> completedNodes;

  QuantumPlayerState({
    required this.playerId,
    required this.currentNodeId,
    this.sparkCoins = 0,
    this.xp = 0,
    List<String>? completedNodes,
  }) : completedNodes = completedNodes ?? [];

  void advance({
    required String nextNodeId,
    required int sparkCoinDelta,
    int xpDelta = 0,
  }) {
    currentNodeId = nextNodeId;
    sparkCoins += sparkCoinDelta;
    xp += xpDelta;
  }

  Map<String, dynamic> toJson() => {
        'playerId': playerId,
        'currentNodeId': currentNodeId,
        'sparkCoins': sparkCoins,
        'xp': xp,
        'completedNodes': completedNodes,
      };

  factory QuantumPlayerState.fromJson(Map<String, dynamic> json) {
    return QuantumPlayerState(
      playerId: json['playerId'] as String,
      currentNodeId: json['currentNodeId'] as String,
      sparkCoins: json['sparkCoins'] as int? ?? 0,
      xp: json['xp'] as int? ?? 0,
      completedNodes: List<String>.from(json['completedNodes'] as List? ?? []),
    );
  }
}
