export const formatCarLabel = (car) => {
  if (!car) return '—';
  const parts = [car.modelName, car.baseSuffix, car.variant].filter(Boolean);
  return parts.join(' ');
};
