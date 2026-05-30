package com.nippon.incentive.service;

import com.nippon.incentive.entity.IncentiveSlab;

import java.util.Comparator;
import java.util.List;

/**
 * Resolves which incentive slab applies for a given quantity.
 * If quantity falls in a gap between tiers, uses the nearest lower tier (highest minCars still &lt;= quantity).
 */
public final class SlabMatcher {

    private SlabMatcher() {
    }

    public static MatchResult match(int quantity, List<IncentiveSlab> slabsForModel) {
        List<IncentiveSlab> eligible = slabsForModel.stream()
                .filter(s -> quantity >= s.getMinCars())
                .sorted(Comparator.comparing(IncentiveSlab::getMinCars).reversed())
                .toList();

        for (IncentiveSlab slab : eligible) {
            if (slab.getMaxCars() == null || quantity <= slab.getMaxCars()) {
                return new MatchResult(slab, false);
            }
        }

        if (!eligible.isEmpty()) {
            return new MatchResult(eligible.get(0), true);
        }

        return new MatchResult(null, false);
    }

    public record MatchResult(IncentiveSlab slab, boolean lowerTierFallback) {
    }
}
