/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUpdateArtifact } from '@looker/sdk';

const UNIQUE_IDENTIFIER_FIELD_NAME = 'rebate_to_sku';
const GROUP_FIELD1_NAME = 'rebate_to_customer';
const GROUP_FIELD1B_NAME = 'weighted_outstanding_rebate';
const GROUP_FIELD2_NAME = 'rebate_to_category';
const RECOMMENDED_REBATE_AMT_FIELD_NAME = 'recommended_rebate_amt';
const ARTIFACT_VALUE_GROUP_KEY = 'Rebate to SKU';

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

export type CustomeInfo = {
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
const SAVABLE_FIELDS = CUSTOM_FIELDS.filter((item) => item.savable).map((item) => item.name);
const EXTRA_SAVABLE_FIELDS = [
  'contract_group',
  'rebate_to_customer',
  'rebate_to_category',
  'rebate_to_sku',
  'cd_percent_total',
];
export const HIDDEN_FIELDS = ['contract_group'];

export function sortAndGroupQueryData(data: any[], fields: Field[]): CustomeInfo[] {
  const gf1 = String(fields.find((f) => f.name.endsWith(GROUP_FIELD1_NAME))?.name);
  const gf1b = String(fields.find((f) => f.name.endsWith(GROUP_FIELD1B_NAME))?.name);
  const gf2 = String(fields.find((f) => f.name.endsWith(GROUP_FIELD2_NAME))?.name);
  const gf3 = String(fields.find((f) => f.name.endsWith(UNIQUE_IDENTIFIER_FIELD_NAME))?.name);
  const rowSpanFields = [gf1, gf1b, gf2];

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

  const customerResult: CustomeInfo[] = [];

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

  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['customer'];
  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['customer'];
  customerResult[customerResult.length - 1].skuInfos[
    customerResult[customerResult.length - 1].skuInfos.length - rowSpanMap['category']
  ].fieldsData[gf2].rowSpan = rowSpanMap['category'];
  return customerResult;
}

function getUidKey(skuName: string, currentSkus: SkuInfo[]) {
  const count = currentSkus.filter((item) => item.skuName === skuName).length;
  return `${skuName}_${String(count).padStart(2, '0')}`;
}

export function calculateSavedArtifactValues(
  customerInfos: CustomeInfo[],
  customFieldsData: NamespaceArtifactValues,
): NamespaceArtifactValues {
  const result = { ...customFieldsData };
  customerInfos.forEach((customerInfo) => {
    result[customerInfo.customer] = {
      ...result[customerInfo.customer],
    };
    if (!result[customerInfo.customer].value) {
      result[customerInfo.customer].value = {};
    }
    let balance = customerInfo.woRebate;
    customerInfo.skuInfos.forEach((skuInfo) => {
      const recmRbtAmtKey = Object.keys(skuInfo).find((k) => k.endsWith(RECOMMENDED_REBATE_AMT_FIELD_NAME)) || '';
      const recommededRebateAmt = skuInfo.fieldsData[recmRbtAmtKey].value;
      const artifactValue: Partial<Record<CustomFieldName, any>> = {
        ...DEFAULT_CUSTOM_FIELD_VALUES,
        ...result[customerInfo.customer].value[skuInfo.uidKey],
      };
      artifactValue[CustomFieldName.RebateAmt] = calculateRebateAmount(artifactValue, recommededRebateAmt);
      balance -= artifactValue[CustomFieldName.RebateAmt];
      artifactValue[CustomFieldName.Balance] = balance;
      artifactValue[CustomFieldName.BalancePercentage] = (balance / customerInfo.woRebate) * 100;
      result[customerInfo.customer].value[skuInfo.uidKey] = artifactValue;
    });
  });

  return result;
}

function calculateRebateAmount(artifactValue: Partial<Record<CustomFieldName, any>>, recommendedAmt: number): number {
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
  return encoded ? `_${encoded}` : '';
}

export function getSavableArtifacts(
  updates: NamespaceArtifactValues,
  current: NamespaceArtifactValues,
  customerInfos: CustomeInfo[],
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
        let tbdSku = pick({ ...currentSkus[uidKey], ...changedSkus[uidKey] }, SAVABLE_FIELDS);
        if (isEmptyObj(tbdSku) || isSubset(tbdSku, DEFAULT_CUSTOM_FIELD_VALUES)) {
          return;
        }
        tbdSku = {
          ...DEFAULT_CUSTOM_FIELD_VALUES,
          ...tbdSku,
        };
        const skuFieldsData = customerData?.skuInfos.find((s) => s.uidKey === uidKey)?.fieldsData || {};
        Object.keys(skuFieldsData).forEach((fieldName) => {
          if (EXTRA_SAVABLE_FIELDS.some((ef) => fieldName.endsWith(ef))) {
            tbdSku[skuFieldsData[fieldName].name] = skuFieldsData[fieldName].value;
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

function isSubset(child: Record<string, any>, parent: Record<string, any>) {
  const keys = Object.keys(child);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (child[key] !== parent[key]) {
      return false;
    }
  }
  return true;
}
