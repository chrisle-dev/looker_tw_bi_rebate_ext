/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUpdateArtifact } from '@looker/sdk';

const ARTIFACT_VALUE_GROUP_KEY = 'Rebate to SKU';

enum FieldName {
  ContractGroup = 'zanalyticstw_bi_rebate_consolidate_v3.contract_group',
  RebateToSKU = 'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku',
  RebateToCustomer = 'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer',
  WoRebate = 'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate',
  RebateToCategory = 'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category',
  RecRebateAmt = 'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt',
  CdPercentTotal = 'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total',
  SumDimOutstandingRebate = 'zanalyticstw_bi_rebate_consolidate_v3.sum_outstanding_rebate_2',
  SumOutstandingRebateDmNonFinal = 'zanalyticstw_bi_rebate_consolidate_v3.sum_outstanding_rebate_dm_non_final',
}

enum RebateType {
  FG = 'Free Goods (FG)',
  CD = 'Cash Discount (CD)',
}

enum CustomFieldName {
  RebateType = 'FG/CD',
  QtyOrAmt = 'FG: Rebate Qty (box) CD: Rebate Amt',
  SellingPrice = 'FG: Selling Price (box)',
  RebateAmt = 'Rebate Amt',
  Balance = 'Balance',
  BalancePercentage = 'Balance %',
}

export type Field = {
  label: string;
  name: string;
  align?: any;
  defaultValue?: any;
  type?: 'select' | 'inputnumber' | 'text';
  options?: { label: string; value: any }[];
  savable?: boolean;
  hidden?: boolean;
  render?: (value: any) => any;
  minWidth?: number;
  maxWidth?: number;
};

export type FieldData = {
  name: string;
  label: string;
  value: any;
  rendered: any;
  rowSpan: number;
  align?: any;
  verticalAlign?: any;
};

export type CustomerInfo = {
  customer: string;
  woRebate: number;
  skuInfos: SkuInfo[];
};

export type SkuInfo = {
  skuName: string;
  uidKey: string;
  fieldsData: Record<string, FieldData>;
};

export type AppliedFilters = Record<string, { value: string; field: any }>;

type CustomerArtifactValues = { [uidBasedOnSKUName: string]: { [fieldLabel: string]: any } };

export type NamespaceArtifactValues = {
  [keyBasedOnCustomerName: string]: { value: CustomerArtifactValues; version: number };
};

export type CheckBalanceEach = {
  total: {
    total: number;
    used: number;
    remaining: number;
  };
  dm: {
    total: number;
    used: number;
    remaining: number;
  };
  nonDm: {
    total: number;
    used: number;
    remaining: number;
  };
};

export type CheckBalanceAll = {
  _all: CheckBalanceEach;
  [key: string]: CheckBalanceEach;
};

export const CUSTOM_FIELDS: Field[] = [
  {
    label: 'FG/CD',
    name: CustomFieldName.RebateType,
    defaultValue: RebateType.CD,
    align: 'left',
    type: 'select',
    options: [
      {
        label: RebateType.FG,
        value: RebateType.FG,
      },
      {
        label: RebateType.CD,
        value: RebateType.CD,
      },
    ],
    savable: true,
  },
  {
    label: 'FG: Rebate Qty\n(box)\nCD: Rebate Amt',
    name: CustomFieldName.QtyOrAmt,
    defaultValue: -1,
    align: 'right',
    type: 'inputnumber',
    savable: true,
  },
  {
    label: 'FG: Selling Price (box)',
    name: CustomFieldName.SellingPrice,
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
    savable: true,
  },
  {
    label: 'Rebate Amt',
    name: CustomFieldName.RebateAmt,
    defaultValue: 0,
    align: 'right',
    type: 'text',
    savable: true,
    render: (value: any) => Number(value).toLocaleString(),
  },
  {
    label: 'Balance',
    name: CustomFieldName.Balance,
    defaultValue: 0,
    align: 'right',
    type: 'text',
    render: (value: any) => Number(value).toLocaleString(),
  },
  {
    label: 'Balance %',
    name: CustomFieldName.BalancePercentage,
    defaultValue: 0,
    align: 'right',
    type: 'text',
    render: (value: any) => Number(value).toFixed(1) + '%',
  },
];

const DEFAULT_CUSTOM_FIELD_VALUES = CUSTOM_FIELDS.filter((item) => item.savable).reduce(
  (acc, cur) => ({ ...acc, [cur.name]: cur.defaultValue }),
  {},
);
const CUSTOM_SAVABLE_FIELD_NAMES = CUSTOM_FIELDS.filter((item) => item.savable).map((item) => item.name);
const REQUIRED_SAVABLE_FIELD_NAMES: string[] = [
  FieldName.ContractGroup,
  FieldName.RebateToCustomer,
  FieldName.RebateToCategory,
  FieldName.RebateToSKU,
  FieldName.CdPercentTotal,
];
export const HIDDEN_FIELDS: string[] = [
  FieldName.ContractGroup,
  FieldName.SumDimOutstandingRebate,
  FieldName.SumOutstandingRebateDmNonFinal,
];

export function sortAndGroupQueryData(data: any[], fields: Field[]): CustomerInfo[] {
  console.log('data', data);
  console.log('fields', fields);
  const gf1 = FieldName.RebateToCustomer;
  const gf1b = FieldName.WoRebate;
  const gf2 = FieldName.RebateToCategory;
  const gf3 = FieldName.RebateToSKU;
  const rowSpanFields: string[] = [gf1, gf1b, gf2];

  const sortedItems = data.sort((a, b) => {
    const ka = `${a[gf1].value}_${a[gf2].value}_${a[gf3].value}`;
    const kb = `${b[gf1].value}_${b[gf2].value}_${b[gf3].value}`;
    return ka.localeCompare(kb);
  });
  let lastCus = '';
  let lastCat = '';
  const rowSpanMap: { [key: string]: number } = {
    customer: 0,
    category: 0,
  };

  const customerResult: CustomerInfo[] = [];

  sortedItems.forEach((item, index) => {
    const customer = item[gf1].value;
    const category = item[gf2].value;
    const woRebate = item[gf1b].value;

    if (customer !== lastCus) {
      if (index > 0) {
        customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['customer'];
        customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['customer'];
      }
      customerResult.push({
        customer: customer,
        woRebate: woRebate || 0,
        skuInfos: [],
      });
      rowSpanMap['customer'] = 1;
      lastCus = customer;
      lastCat = '';
    } else {
      rowSpanMap['customer']++;
    }

    if (category !== lastCat) {
      const skuLen = customerResult[customerResult.length - 1].skuInfos.length;
      if (skuLen > 0) {
        customerResult[customerResult.length - 1].skuInfos[skuLen - rowSpanMap['category']].fieldsData[gf2].rowSpan =
          rowSpanMap['category'];
      } else if (customerResult.length > 1) {
        customerResult[customerResult.length - 2].skuInfos[
          customerResult[customerResult.length - 2].skuInfos.length - rowSpanMap['category']
        ].fieldsData[gf2].rowSpan = rowSpanMap['category'];
      }
      rowSpanMap['category'] = 1;
      lastCat = category;
    } else {
      rowSpanMap['category']++;
    }

    const values = fields.reduce<Record<string, FieldData>>((acc, cur) => {
      return {
        ...acc,
        [cur.name]: {
          name: cur.name,
          label: cur.label,
          value: item[cur.name] ? item[cur.name].value : cur.defaultValue,
          rendered: item[cur.name] ? item[cur.name].rendered || item[cur.name].value : cur.defaultValue,
          rowSpan: rowSpanFields.includes(cur.name) || cur.hidden ? 0 : 1,
          verticalAlign: rowSpanFields.includes(cur.name) ? 'top' : 'middle',
          align: cur.align,
          hidden: cur.hidden,
        },
      };
    }, {});

    const skuName = values[gf3]?.value || '';
    customerResult[customerResult.length - 1].skuInfos.push({
      skuName,
      uidKey: getUidKey(skuName, customerResult[customerResult.length - 1].skuInfos),
      fieldsData: values,
    });
  });
  console.log('customerResult', customerResult);
  if (customerResult.length) {
    customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['customer'];
    customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['customer'];
    customerResult[customerResult.length - 1].skuInfos[
      customerResult[customerResult.length - 1].skuInfos.length - rowSpanMap['category']
    ].fieldsData[gf2].rowSpan = rowSpanMap['category'];
  }
  return customerResult;
}

function getUidKey(skuName: string, currentSkus: SkuInfo[]) {
  const count = currentSkus.filter((item) => item.skuName === skuName).length;
  return `${skuName}_${String(count).padStart(2, '0')}`;
}

export function calculateSavedArtifactValues(
  customerInfos: CustomerInfo[],
  customFieldsData: NamespaceArtifactValues,
): { artifactValues: NamespaceArtifactValues; checkBalanceValues: CheckBalanceAll } {
  let checkBalanceValues: CheckBalanceAll = {
    _all: {
      total: {
        total: 0,
        used: 0,
        remaining: 0,
      },
      dm: {
        total: 0,
        used: 0,
        remaining: 0,
      },
      nonDm: {
        total: 0,
        used: 0,
        remaining: 0,
      },
    },
  };
  const result = { ...customFieldsData };
  let skuIdx = -1;
  customerInfos.forEach((customerInfo) => {
    result[customerInfo.customer] = {
      ...result[customerInfo.customer],
    };
    if (!result[customerInfo.customer].value) {
      result[customerInfo.customer].value = {};
    }
    checkBalanceValues[customerInfo.customer] = {
      total: {
        total: 0,
        used: 0,
        remaining: 0,
      },
      dm: {
        total: 0,
        used: 0,
        remaining: 0,
      },
      nonDm: {
        total: 0,
        used: 0,
        remaining: 0,
      },
    };
    let balance = customerInfo.woRebate;
    customerInfo.skuInfos.forEach((skuInfo) => {
      skuIdx++;
      const recommededRebateAmt = skuInfo.fieldsData[FieldName.RecRebateAmt].value;
      const outRbtDmNonFinal = skuInfo.fieldsData[FieldName.SumOutstandingRebateDmNonFinal].value;
      const sumDimOutRbt = skuInfo.fieldsData[FieldName.SumDimOutstandingRebate].value;
      const isDM = skuInfo.fieldsData[FieldName.RebateToCategory].value === 'DM';
      const artifactValue: Partial<Record<CustomFieldName, any>> = {
        ...DEFAULT_CUSTOM_FIELD_VALUES,
        ...result[customerInfo.customer].value[skuInfo.uidKey],
      };

      artifactValue[CustomFieldName.RebateAmt] = calculateRebateAmount(artifactValue, recommededRebateAmt, skuIdx);
      if (isDM) {
        checkBalanceValues[customerInfo.customer].dm.total = outRbtDmNonFinal;
        checkBalanceValues[customerInfo.customer].dm.used += artifactValue[CustomFieldName.RebateAmt];
      } else {
        checkBalanceValues[customerInfo.customer].nonDm.total = outRbtDmNonFinal;
        checkBalanceValues[customerInfo.customer].nonDm.used += artifactValue[CustomFieldName.RebateAmt];
      }
      checkBalanceValues[customerInfo.customer].total.total = sumDimOutRbt;
      balance -= artifactValue[CustomFieldName.RebateAmt];
      artifactValue[CustomFieldName.Balance] = balance;
      artifactValue[CustomFieldName.BalancePercentage] = (balance / customerInfo.woRebate) * 100 || 0;
      result[customerInfo.customer].value[skuInfo.uidKey] = artifactValue;
    });
  });
  checkBalanceValues = calculateCheckBalanceAll(checkBalanceValues);
  return { artifactValues: result, checkBalanceValues };
}

function calculateCheckBalanceAll(balance: CheckBalanceAll): CheckBalanceAll {
  const { _all, ...rest } = balance;
  Object.keys(rest).forEach((customerName: string) => {
    const values = rest[customerName];
    values.dm.remaining = values.dm.total - values.dm.used;
    values.nonDm.remaining = values.nonDm.total - values.nonDm.used;
    values.total.used = values.dm.used + values.nonDm.used;
    values.total.remaining = values.total.total - values.total.used;
    _all.dm.total += values.dm.total;
    _all.dm.used += values.dm.used;
    _all.nonDm.total += values.nonDm.total;
    _all.nonDm.used += values.nonDm.used;
    _all.total.total += values.total.total;
    balance[customerName] = values;
  });
  _all.dm.remaining = _all.dm.total - _all.dm.used;
  _all.nonDm.remaining = _all.nonDm.total - _all.nonDm.used;
  _all.total.used = _all.dm.used + _all.nonDm.used;
  _all.total.remaining = _all.total.total - _all.total.used;
  balance._all = _all;
  return balance;
}

export function updateCheckBalanceAll(
  customerName: string,
  currentBalanceAll: CheckBalanceAll,
  changedOne: CheckBalanceEach,
): CheckBalanceAll {
  const balance = deepClone(currentBalanceAll);
  const currentCus = balance[customerName];
  if (!currentCus) return balance;
  balance._all.dm.total = balance._all.dm.total - currentCus.dm.total + changedOne.dm.total;
  balance._all.dm.used = balance._all.dm.used - currentCus.dm.used + changedOne.dm.used;
  balance._all.dm.remaining = balance._all.dm.total - balance._all.dm.used;

  balance._all.nonDm.total = balance._all.nonDm.total - currentCus.nonDm.total + changedOne.nonDm.total;
  balance._all.nonDm.used = balance._all.nonDm.used - currentCus.nonDm.used + changedOne.nonDm.used;
  balance._all.nonDm.remaining = balance._all.nonDm.total - balance._all.nonDm.used;

  balance._all.total.total = balance._all.total.total - currentCus.total.total + changedOne.total.total;
  balance._all.total.used = balance._all.total.used - currentCus.total.used + changedOne.total.used;
  balance._all.total.remaining = balance._all.total.remaining - currentCus.total.remaining + changedOne.total.remaining;
  balance[customerName] = changedOne;
  return balance;
}

function calculateRebateAmount(
  artifactValue: Partial<Record<CustomFieldName, any>>,
  recommendedAmt: number,
  skuIdx: number,
): number {
  if (skuIdx >= 15) return 0;
  let value = artifactValue[CustomFieldName.QtyOrAmt];
  if (artifactValue[CustomFieldName.RebateType] === RebateType.FG) {
    value = artifactValue[CustomFieldName.QtyOrAmt] * artifactValue[CustomFieldName.SellingPrice];
  }
  if (value < 0) {
    value = recommendedAmt || 0;
  }
  return value;
}

function encodeArtifactValue(obj: CustomerArtifactValues, filters: Record<string, any>): string {
  const data = Object.values(obj);
  return encodeURIComponent(JSON.stringify({ data, filters }));
}

export function decodeArtifactValue(value: string): CustomerArtifactValues {
  try {
    const { data }: { data: any[] } = JSON.parse(decodeURIComponent(value));
    const decoded = data.reduce(
      (acc, cur, curIndex) => ({ ...acc, [getUidKey2(cur, data.slice(0, curIndex))]: cur }),
      {},
    );
    return decoded;
  } catch (error) {
    console.error('decodeArtifactValue', error);
    return {};
  }
}

function getUidKey2(skuInfo: Record<string, any>, currentSkus: Record<string, any>[]) {
  const skuName = skuInfo[ARTIFACT_VALUE_GROUP_KEY];
  const count = currentSkus.filter((item) => item[ARTIFACT_VALUE_GROUP_KEY] === skuName).length;
  return `${skuName}_${String(count).padStart(2, '0')}`;
}

export function getFilteredObject(filters: AppliedFilters): Record<string, any> {
  if (!filters) return {};
  return Object.values(filters).reduce((acc, cur) => ({ ...acc, [cur.field.label_short]: cur.value }), {});
}

export function encodeFilteredObject(filters: AppliedFilters) {
  const obj = getFilteredObject(filters);
  const encoded = Object.values(obj)
    .map((f) => f.replace(/[^\w]/g, ''))
    .filter((f) => !!f)
    .join('_');
  return encoded ? `${encoded}` : '';
}

export function getSavableArtifacts(
  updates: NamespaceArtifactValues,
  current: NamespaceArtifactValues,
  customerInfos: CustomerInfo[],
  filters: Record<string, any>,
): Partial<IUpdateArtifact[]> {
  const result: Partial<IUpdateArtifact[]> = [];
  if (isEmptyObj(updates)) return result;
  Object.keys(updates).forEach((customer) => {
    const customerData = customerInfos.find((c) => c.customer === customer);
    const changedSkus = updates[customer].value;
    const currentSkus = current[customer].value || {};
    const toBeUpdated: Record<string, any> = {};

    Object.keys(currentSkus)
      .sort((a, b) => a.localeCompare(b))
      .forEach((uidKey) => {
        let tbdSku = pick({ ...currentSkus[uidKey], ...changedSkus[uidKey] }, CUSTOM_SAVABLE_FIELD_NAMES);
        tbdSku = {
          ...DEFAULT_CUSTOM_FIELD_VALUES,
          ...tbdSku,
        };
        const skuFieldsData = customerData?.skuInfos.find((s) => s.uidKey === uidKey)?.fieldsData || {};
        Object.keys(skuFieldsData).forEach((fieldName) => {
          if (REQUIRED_SAVABLE_FIELD_NAMES.includes(fieldName)) {
            tbdSku[skuFieldsData[fieldName].label] = skuFieldsData[fieldName].value;
          }
        });
        toBeUpdated[uidKey] = tbdSku;
      });

    result.push({
      key: customer,
      value: encodeArtifactValue(toBeUpdated, filters),
      version: current[customer].version,
    });
  });
  return result;
}

function pick(obj: Record<string, any>, paths: string[]): Record<string, any> {
  if (!obj) return {};
  return paths.filter((key) => obj[key] !== undefined).reduce((acc, cur) => ({ ...acc, [cur]: obj[cur] }), {});
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    result.push(chunk);
  }
  return result;
}

function isEmptyObj(obj: Record<string, any>): boolean {
  return Object.values(obj).filter((v) => v !== undefined).length === 0;
}

function deepClone(src: any): any {
  if (src === null || typeof src !== 'object') return src;
  if (Array.isArray(src)) return src.map(deepClone);
  const copy: Record<string, any> = {};
  for (const key in src) {
    if (src.hasOwnProperty(key)) {
      copy[key] = deepClone(src[key]);
    }
  }
  return copy;
}

export function debounce(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
