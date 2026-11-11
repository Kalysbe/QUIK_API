import { resolveOwner, filterRowsForAccess, findForeignValues } from "../depositoryAccess.js";

const A = 1;
const B = 2;

const rules = [
  { depository_id: A, resource: "depo_account", match_type: "contains", value: "1-3001" },
  { depository_id: A, resource: "depo_account", match_type: "contains", value: "1-3101" },
  { depository_id: A, resource: "depo_account", match_type: "contains", value: "1-3301" },
  { depository_id: B, resource: "depo_account", match_type: "default", value: "" },
  { depository_id: B, resource: "depo_account", match_type: "exact", value: "1-3101-99" },
  { depository_id: A, resource: "money_tag", match_type: "exact", value: "EQTV" },
  { depository_id: B, resource: "money_tag", match_type: "exact", value: "FX" },
  { depository_id: A, resource: "trade_class", match_type: "prefix", value: "LIST" },
  { depository_id: B, resource: "trade_class", match_type: "exact", value: "LIST_GD" },
];

describe("resolveOwner", () => {
  test("accounts with 1-3001/1-3101/1-3301 belong to A, others go to default B", () => {
    expect(resolveOwner(rules, "depo_account", "1-3101-83")).toBe(A);
    expect(resolveOwner(rules, "depo_account", "1-3001-70")).toBe(A);
    expect(resolveOwner(rules, "depo_account", "1-3301-69")).toBe(A);
    expect(resolveOwner(rules, "depo_account", "L-400-83")).toBe(B);
    expect(resolveOwner(rules, "depo_account", "2011-01")).toBe(B);
  });

  test("exact rule beats contains", () => {
    expect(resolveOwner(rules, "depo_account", "1-3101-99")).toBe(B);
  });

  test("case and spaces are ignored", () => {
    expect(resolveOwner(rules, "money_tag", " eqtv ")).toBe(A);
  });

  test("unmatched value without default belongs to nobody", () => {
    expect(resolveOwner(rules, "money_tag", "USD")).toBeNull();
    expect(resolveOwner(rules, "trade_class", "QME_FX")).toBeNull();
  });

  test("empty value belongs to nobody even with default rule", () => {
    expect(resolveOwner(rules, "depo_account", "")).toBeNull();
    expect(resolveOwner(rules, "depo_account", null)).toBeNull();
  });

  test("exact class beats prefix", () => {
    expect(resolveOwner(rules, "trade_class", "LISTBND")).toBe(A);
    expect(resolveOwner(rules, "trade_class", "LIST_GD")).toBe(B);
  });

  test("equally specific rules of two depositories => nobody", () => {
    const tie = [
      { depository_id: A, resource: "depo_account", match_type: "contains", value: "AB" },
      { depository_id: B, resource: "depo_account", match_type: "contains", value: "CD" },
    ];
    expect(resolveOwner(tie, "depo_account", "ABCD")).toBeNull();
  });

  test("rules of other resources are not used", () => {
    expect(resolveOwner(rules, "money_tag", "1-3101-83")).toBeNull();
  });
});

describe("filterRowsForAccess / findForeignValues", () => {
  const rows = [
    { Trdacc: "1-3101-83" },
    { Trdacc: "L-400-83" },
    { Trdacc: "1-3001-70" },
  ];
  const accessA = { isAdmin: false, depository: { id: A }, rules };
  const accessB = { isAdmin: false, depository: { id: B }, rules };

  test("depositories see only their own rows", () => {
    expect(filterRowsForAccess(accessA, rows, "depo_account", "Trdacc")).toEqual([rows[0], rows[2]]);
    expect(filterRowsForAccess(accessB, rows, "depo_account", "Trdacc")).toEqual([rows[1]]);
  });

  test("admin sees everything", () => {
    expect(filterRowsForAccess({ isAdmin: true }, rows, "depo_account", "Trdacc")).toEqual(rows);
  });

  test("write check reports foreign values", () => {
    expect(findForeignValues(accessB, "depo_account", ["L-405-70", "1-3101-83", "1-3101-83"])).toEqual(["1-3101-83"]);
    expect(findForeignValues(accessA, "money_tag", ["EQTV"])).toEqual([]);
  });

  test("missing access context fails closed", () => {
    expect(() => filterRowsForAccess(undefined, rows, "depo_account", "Trdacc")).toThrow();
  });
});
