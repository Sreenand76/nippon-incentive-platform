/**
 * Resolve slab for a quantity:
 * 1) Exact fit: minCars <= qty <= maxCars (or open-ended max)
 * 2) Gap / in-between: use nearest lower tier (highest minCars still <= qty)
 */
export const matchSlab = (quantity, slabs = []) => {
  const eligible = slabs
    .filter((s) => quantity >= s.minCars)
    .sort((a, b) => b.minCars - a.minCars);

  for (const slab of eligible) {
    if (slab.maxCars == null || slab.maxCars === undefined || quantity <= slab.maxCars) {
      return { slab, lowerTierFallback: false };
    }
  }

  if (eligible.length > 0) {
    return { slab: eligible[0], lowerTierFallback: true };
  }

  return { slab: null, lowerTierFallback: false };
};

export const calculateModelIncentives = (cars, slabs, quantities) => {
  const slabsByCarId = slabs.reduce((acc, slab) => {
    const carId = slab.carModel?.id;
    if (!carId) return acc;
    if (!acc[carId]) acc[carId] = [];
    acc[carId].push(slab);
    return acc;
  }, {});

  let totalCars = 0;
  let totalIncentive = 0;
  const breakdown = [];

  for (const car of cars) {
    const quantity = Number(quantities[car.id] || 0);
    if (quantity <= 0) continue;

    totalCars += quantity;
    const { slab: matched, lowerTierFallback } = matchSlab(
      quantity,
      slabsByCarId[car.id] || []
    );
    const incentivePerCar = matched ? Number(matched.amountPerCar) : 0;
    const lineIncentive = incentivePerCar * quantity;
    totalIncentive += lineIncentive;

    const parts = [car.modelName, car.baseSuffix, car.variant].filter(Boolean);
    breakdown.push({
      carId: car.id,
      carModelName: parts.join(' '),
      quantity,
      matchedSlabId: matched?.id ?? null,
      incentivePerCar,
      lineIncentive,
      lowerTierFallback,
    });
  }

  return { totalCars, totalIncentive, breakdown };
};
