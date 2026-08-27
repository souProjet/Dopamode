import { describe, expect, it } from 'vitest';
import {
  SHOP_CATALOG,
  getShopItem,
  getThemeIds,
  XP_SHOP_BONUS_PER_CHARGE,
  type ShopCatalogEntry,
} from './catalog';
import {
  hasAllPermanentBundleGrants,
  buildCoinPurchasedSkuSet,
  catalogItemFullyOwned,
} from './bundleOwnership';
import { COIN_PACKS, getCoinPack } from './coinPacks';
import { bonusPercentVsPack, questCoinsPerEuro } from './marketing';
import { getTitleDefinition, TITLE_IDS } from './titles';
import {
  getQuestPack,
  listQuestPacksByKind,
  questPackBiasFromOwned,
  questPackLabels,
} from './questPacks';

describe('catalog', () => {
  it('expose des SKU uniques', () => {
    const skus = SHOP_CATALOG.map((e) => e.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });
  it('ne vend plus de relances : elles sont offertes et montent avec le niveau', () => {
    expect(SHOP_CATALOG.some((e) => e.kind === 'reroll_pack')).toBe(false);
    expect(SHOP_CATALOG.some((e) => (e.grants.bonusRerolls ?? 0) > 0)).toBe(false);
  });
  it('les packs de quêtes restent atteignables en jouant', () => {
    const packs = SHOP_CATALOG.filter((e) => e.kind === 'quest_pack');
    expect(packs.length).toBeGreaterThan(0);
    for (const p of packs) expect(p.priceCoins).toBeLessThanOrEqual(500);
  });
  it('getShopItem et getThemeIds', () => {
    expect(getShopItem('nope')).toBeUndefined();
    expect(getShopItem(SHOP_CATALOG[0]!.sku)).toBeDefined();
    expect(getThemeIds()).toContain('default');
    expect(XP_SHOP_BONUS_PER_CHARGE).toBeGreaterThan(0);
  });
});

describe('bundleOwnership', () => {
  // Le catalogue ne vend plus ni bundle ni relances : on garde des entrées
  // synthétiques pour couvrir les `kind` encore supportés par les helpers.
  const bundle: ShopCatalogEntry = {
    sku: 'test_bundle_unit',
    kind: 'bundle',
    name: 'Bundle test',
    description: '',
    priceCoins: 100,
    icon: 'Compass',
    grants: { titles: ['scout'], xpBonusCharges: 2 },
  };
  const rerollPack: ShopCatalogEntry = {
    sku: 'test_reroll_unit',
    kind: 'reroll_pack',
    name: 'Relances test',
    description: '',
    priceCoins: 100,
    icon: 'Dices',
    grants: { bonusRerolls: 3 },
  };
  it('hasAllPermanentBundleGrants false si non bundle', () => {
    const nonBundle = SHOP_CATALOG.find((c) => c.kind === 'xp_booster')!;
    expect(hasAllPermanentBundleGrants(nonBundle, [], [])).toBe(false);
  });
  it('hasAllPermanentBundleGrants quand tout est possédé', () => {
    expect(
      hasAllPermanentBundleGrants(
        bundle,
        [],
        bundle.grants.titles ?? [],
      ),
    ).toBe(true);
  });
  it('buildCoinPurchasedSkuSet', () => {
    const s = buildCoinPurchasedSkuSet([
      { primarySku: 'a', status: 'paid', entryKind: 'coin_purchase' },
      { primarySku: 'b', status: 'pending', entryKind: 'coin_purchase' },
      { primarySku: 'c', status: 'paid' },
    ]);
    expect(s.has('a')).toBe(true);
    expect(s.has('b')).toBe(false);
  });
  it('catalogItemFullyOwned — reroll et xp toujours false', () => {
    const xp = SHOP_CATALOG.find((c) => c.kind === 'xp_booster')!;
    expect(catalogItemFullyOwned(rerollPack, {}, new Set())).toBe(false);
    expect(catalogItemFullyOwned(xp, {}, new Set())).toBe(false);
  });
  it('catalogItemFullyOwned — bundle avec achat coin', () => {
    const shop = {
      ownedThemes: ['default'],
      ownedTitleIds: bundle.grants.titles,
    };
    expect(catalogItemFullyOwned(bundle, shop, new Set([bundle.sku]))).toBe(true);
  });
  it('catalogItemFullyOwned — quest_pack quand tous les ids sont possédés', () => {
    const packItem = SHOP_CATALOG.find((c) => c.kind === 'quest_pack')!;
    const ids = packItem.grants.questPackIds ?? [];
    expect(ids.length).toBeGreaterThan(0);
    expect(
      catalogItemFullyOwned(packItem, { ownedQuestPackIds: [...ids] }, new Set()),
    ).toBe(true);
  });
  it('catalogItemFullyOwned — quest_pack incomplet', () => {
    const packItem = SHOP_CATALOG.find((c) => c.kind === 'quest_pack')!;
    const ids = packItem.grants.questPackIds ?? [];
    if (ids.length < 2) return;
    expect(catalogItemFullyOwned(packItem, { ownedQuestPackIds: [ids[0]!] }, new Set())).toBe(
      false,
    );
  });
  it('catalogItemFullyOwned — title (entrée hors catalogue, kind encore supporté)', () => {
    const titleItem: ShopCatalogEntry = {
      sku: 'test_title_unit',
      kind: 'title',
      name: 'Titre test',
      description: '',
      priceCoins: 1,
      icon: 'Award',
      grants: { titles: ['scout'] },
    };
    expect(
      catalogItemFullyOwned(titleItem, { ownedTitleIds: titleItem.grants.titles }, new Set()),
    ).toBe(true);
  });
});

describe('coinPacks', () => {
  it('getCoinPack', () => {
    expect(getCoinPack('x')).toBeUndefined();
    expect(getCoinPack(COIN_PACKS[0]!.sku)).toBeDefined();
  });
});

describe('marketing', () => {
  it('questCoinsPerEuro et bonusPercentVsPack', () => {
    expect(questCoinsPerEuro(0, 100)).toBe(0);
    expect(questCoinsPerEuro(100, 50)).toBeGreaterThan(0);
    const ref = { priceCents: 499, coinsGranted: 500 };
    const a = bonusPercentVsPack({ priceCents: 999, coinsGranted: 1200 }, ref);
    expect(typeof a).toBe('number');
    expect(bonusPercentVsPack(ref, { priceCents: 0, coinsGranted: 1 })).toBe(0);
  });
});

describe('titles', () => {
  it('registry et getTitleDefinition', () => {
    expect(TITLE_IDS.length).toBeGreaterThan(0);
    expect(getTitleDefinition('scout')?.icon).toBeDefined();
    expect(getTitleDefinition('zzz')).toBeUndefined();
  });
});

describe('questPacks helpers', () => {
  it('getQuestPack et listQuestPacksByKind', () => {
    expect(getQuestPack('__none__')).toBeUndefined();
    expect(getQuestPack('pack_couple')?.kind).toBe('vibe');
    const vibes = listQuestPacksByKind('vibe');
    expect(vibes.length).toBeGreaterThan(0);
    expect(vibes.every((p) => p.kind === 'vibe')).toBe(true);
  });

  it('questPackBiasFromOwned cumule et borne', () => {
    expect(questPackBiasFromOwned(undefined)).toEqual({});
    expect(questPackBiasFromOwned([])).toEqual({});
    const bias = questPackBiasFromOwned(['pack_couple', 'pack_couple', 'unknown_pack']);
    expect(Object.keys(bias).length).toBeGreaterThan(0);
    for (const v of Object.values(bias)) {
      expect(Math.abs(v!)).toBeLessThanOrEqual(0.18);
    }
  });

  it('questPackLabels selon locale', () => {
    expect(questPackLabels(undefined, 'fr')).toEqual([]);
    const fr = questPackLabels(['pack_couple'], 'fr');
    const en = questPackLabels(['pack_couple'], 'en');
    expect(fr[0]).toContain('Couple');
    expect(en[0]).toMatch(/couple/i);
  });
});
