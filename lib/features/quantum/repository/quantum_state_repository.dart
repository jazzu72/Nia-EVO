import 'dart:convert';
import 'dart:io';

import '../state/quantum_player_state.dart';

class QuantumStateRepository {
  final String filePath;

  QuantumStateRepository({required this.filePath});

  Future<void> save(QuantumPlayerState state) async {
    final file = File(filePath);
    await file.parent.create(recursive: true);
    await file.writeAsString(
      const JsonEncoder.withIndent('  ').convert(state.toJson()),
    );
  }

  Future<QuantumPlayerState?> load() async {
    final file = File(filePath);

    if (!await file.exists()) {
      return null;
    }

    final json = jsonDecode(await file.readAsString());

    if (json is! Map<String, dynamic>) {
      throw FormatException('Invalid Quantum player state.');
    }

    return QuantumPlayerState.fromJson(json);
  }

  Future<bool> exists() async {
    return File(filePath).exists();
  }
}
