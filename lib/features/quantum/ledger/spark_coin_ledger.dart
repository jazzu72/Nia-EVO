class SparkCoinTransaction {
  final String nodeId;
  final String choiceId;
  final int delta;
  final int balance;

  const SparkCoinTransaction({
    required this.nodeId,
    required this.choiceId,
    required this.delta,
    required this.balance,
  });

  Map<String, dynamic> toJson() => {
        'nodeId': nodeId,
        'choiceId': choiceId,
        'delta': delta,
        'balance': balance,
      };
}

class SparkCoinLedger {
  int _balance;
  final List<SparkCoinTransaction> _history = [];

  SparkCoinLedger({int startingBalance = 0}) : _balance = startingBalance;

  int get balance => _balance;

  List<SparkCoinTransaction> get history => List.unmodifiable(_history);

  int apply({
    required String nodeId,
    required String choiceId,
    required int delta,
  }) {
    _balance += delta;

    _history.add(
      SparkCoinTransaction(
        nodeId: nodeId,
        choiceId: choiceId,
        delta: delta,
        balance: _balance,
      ),
    );

    return _balance;
  }
}
