-- Retrait des archétypes purgés (chantier 1 : refonte de la taxonomie).
--
-- Les lignes sont conservées, pas supprimées : `quest_logs` les référence et
-- l'historique des joueurs doit rester lisible. `published = false` les sort
-- simplement du tirage (cf. `selectCandidates`).
--
-- 92 archétypes retirés : la taxonomie de `@questia/shared`
-- (`QUEST_ARCHETYPES_SEED`) ne les contient plus.
UPDATE "quest_archetypes"
SET "published" = false, "updated_at" = NOW()
WHERE "id" IN (
  17, 19, 24, 39, 41, 42, 52, 55, 87, 88, 89, 90,
  91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103,
  104, 105, 106, 107, 108, 109, 110, 111, 113, 116, 117, 118,
  119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
  131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142,
  143, 144, 145, 146, 148, 149, 151, 152, 153, 154, 155, 156,
  157, 158, 159, 160, 161, 162, 168, 169, 170, 171, 172, 173,
  174, 175, 177, 180, 183, 184, 185, 186
);
