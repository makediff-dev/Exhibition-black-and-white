/** Fixture IDs retired in Phase 3. Drop them from persisted prototype storage. */
export const RETIRED_FIXTURE_IDS = new Set(["opay-7"]);

/**
 * Seed wins for identity and relations. Persist may keep runtime fields
 * (status) and user-created rows that are not retired fixtures.
 */
export function overlaySeedRecords<T extends { id: string }>(
  stored: T[] | undefined,
  seedItems: T[],
  runtimeKeys: (keyof T)[] = []
): T[] {
  if (!stored?.length) return seedItems;

  const storedMap = new Map(stored.map((item) => [item.id, item]));
  const seedIds = new Set(seedItems.map((item) => item.id));

  const merged = seedItems.map((seedItem) => {
    const local = storedMap.get(seedItem.id);
    if (!local) return seedItem;

    const runtime = {} as Partial<T>;
    for (const key of runtimeKeys) {
      if (local[key] !== undefined) {
        runtime[key] = local[key];
      }
    }
    return { ...seedItem, ...runtime };
  });

  const extras = stored.filter(
    (item) => !seedIds.has(item.id) && !RETIRED_FIXTURE_IDS.has(item.id)
  );

  return extras.length ? [...merged, ...extras] : merged;
}
