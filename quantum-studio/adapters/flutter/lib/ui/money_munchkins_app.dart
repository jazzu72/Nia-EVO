import 'package:flutter/material.dart';

import '../domain/quantum_events.dart';
import '../presentation/world_map_screen.dart';
import '../presentation/world_map_screen_model.dart';

class MoneyMunchkinsApp extends StatelessWidget {
  const MoneyMunchkinsApp({super.key});

  @override
  Widget build(BuildContext context) {
    const state = WorldState(
      aggregateId: 'player:demo',
      phase: GamePhase.briefing,
      playerResources: {
        'spark_coins': 50,
        'xp': 0,
      },
      unlockedLocations: [
        'loc_market_district',
      ],
    );

    final screen = WorldMapScreen(
      model: WorldMapScreenModel.fromState(state),
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Money Munchkins: Quantum Odyssey',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF071510),
        fontFamily: 'sans',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD6A84F),
          brightness: Brightness.dark,
        ),
      ),
      home: SparkCityPage(screen: screen),
    );
  }
}

class SparkCityPage extends StatelessWidget {
  final WorldMapScreen screen;

  const SparkCityPage({
    super.key,
    required this.screen,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: _HeroHeader(screen: screen),
            ),
            SliverToBoxAdapter(
              child: _SectionTitle(
                title: 'Explore Spark City',
                subtitle: 'Every choice opens a new possibility.',
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                20,
                0,
                20,
                24,
              ),
              sliver: SliverGrid(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final location = screen.model.world.locations[index];

                    return _LocationCard(
                      name: location.name,
                      subtitle: location.subtitle,
                      unlocked: location.unlocked,
                    );
                  },
                  childCount: screen.model.world.locations.length,
                ),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 0.92,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: _SectionTitle(
                title: 'Missions',
                subtitle: 'Complete missions to grow your skills.',
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                20,
                0,
                20,
                32,
              ),
              sliver: SliverList.builder(
                itemCount: screen.model.missions.length,
                itemBuilder: (context, index) {
                  final mission = screen.model.missions[index];

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _MissionCard(
                      title: mission.title,
                      description: mission.description,
                      rewardCoins: mission.reward.sparkCoins,
                      rewardXp: mission.reward.xp,
                      completed: mission.completed,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroHeader extends StatelessWidget {
  final WorldMapScreen screen;

  const _HeroHeader({
    required this.screen,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF12372B),
            Color(0xFF0A211A),
          ],
        ),
        border: Border.all(
          color: const Color(0xFFD6A84F),
          width: 0.7,
        ),
        boxShadow: const [
          BoxShadow(
            blurRadius: 30,
            offset: Offset(0, 12),
            color: Color(0x55000000),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'MONEY MUNCHKINS',
            style: TextStyle(
              letterSpacing: 3,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFFD6A84F),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            screen.title,
            style: const TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            screen.subtitle,
            style: TextStyle(
              color: Colors.white.withValues(
                alpha: 0.72,
              ),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              _StatPill(
                icon: Icons.auto_awesome,
                label: '${screen.sparkCoins} Spark Coins',
              ),
              const SizedBox(width: 10),
              _StatPill(
                icon: Icons.star_rounded,
                label: '${screen.xp} XP',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _StatPill({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 13,
        vertical: 9,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 17,
            color: const Color(0xFFD6A84F),
          ),
          const SizedBox(width: 7),
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        20,
        8,
        20,
        16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              color: Colors.white.withValues(
                alpha: 0.58,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocationCard extends StatelessWidget {
  final String name;
  final String subtitle;
  final bool unlocked;

  const _LocationCard({
    required this.name,
    required this.subtitle,
    required this.unlocked,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: unlocked ? const Color(0xFF10291F) : const Color(0xFF0C1713),
        border: Border.all(
          color: unlocked ? const Color(0xFFD6A84F) : Colors.white12,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            unlocked ? Icons.explore_rounded : Icons.lock_outline_rounded,
            color: unlocked ? const Color(0xFFD6A84F) : Colors.white38,
            size: 28,
          ),
          const Spacer(),
          Text(
            name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            unlocked ? subtitle : 'Keep exploring to unlock.',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(
                alpha: 0.58,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MissionCard extends StatelessWidget {
  final String title;
  final String description;
  final int rewardCoins;
  final int rewardXp;
  final bool completed;

  const _MissionCard({
    required this.title,
    required this.description,
    required this.rewardCoins,
    required this.rewardXp,
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFF0E2119),
        border: Border.all(
          color: completed ? Colors.white12 : const Color(0xFFD6A84F),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFD6A84F).withValues(alpha: 0.12),
            ),
            child: Icon(
              completed ? Icons.check_rounded : Icons.auto_awesome,
              color: const Color(0xFFD6A84F),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withValues(
                      alpha: 0.58,
                    ),
                  ),
                ),
                const SizedBox(height: 9),
                Text(
                  completed
                      ? 'COMPLETED'
                      : '+$rewardCoins Spark • +$rewardXp XP',
                  style: const TextStyle(
                    color: Color(0xFFD6A84F),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
