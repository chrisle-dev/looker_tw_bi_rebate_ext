import { IUpdateArtifact, IQuery } from '@looker/sdk';

const UNIQUE_IDENTIFIER_FIELD_NAME = 'rebate_to_sku';
const GROUP_FIELD1_NAME = 'rebate_to_customer';
const GROUP_FIELD1B_NAME = 'weighted_outstanding_rebate';
const GROUP_FIELD2_NAME = 'rebate_to_category';
const ARTIFACT_VALUE_GROUP_KEY = 'Rebate to SKU';

export type Field = {
  label: string;
  name: string;
  align?: any;
  defaultValue?: any;
  type?: 'select' | 'inputnumber' | 'text';
  options?: { label: string; value: any }[];
  savable?: boolean;
  hidden?: boolean;
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
  uidKey: string;
  fieldsData: Record<string, FieldData>;
};

export type AppliedFilters = Record<string, { value: string; field: any }>;

type ArtifactValue = Record<string, any>;

export type NormalizedArtifacts = Record<string, { value: ArtifactValue; version: number }>;

export const CUSTOM_FIELDS: Field[] = [
  {
    label: 'FG/CD',
    name: 'fg_cd',
    defaultValue: 'Free Goods (FG)',
    align: 'left',
    type: 'select',
    options: [
      {
        label: 'Free Goods (FG)',
        value: 'Free Goods (FG)',
      },
      {
        label: 'Cash Discount (CD)',
        value: 'Cash Discount (CD)',
      },
    ],
    savable: true,
  },
  {
    label: 'Rebate Product Qty',
    name: 'rebate_product_qty',
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
    savable: true,
  },
  {
    label: 'Selling Price',
    name: 'selling_price',
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
    savable: true,
  },
  {
    label: 'Rebate Amount',
    name: 'rebate_amount',
    defaultValue: 0,
    align: 'right',
    type: 'text',
    savable: true,
  },
  {
    label: 'Balance',
    name: 'balance',
    defaultValue: 0,
    align: 'right',
    type: 'text',
  },
];

const DEFAULT_CUSTOM_FIELD_VALUES = CUSTOM_FIELDS.filter((item) => item.savable).reduce(
  (acc, cur) => ({ ...acc, [cur.label]: cur.defaultValue }),
  {},
);
const SAVABLE_FIELDS = CUSTOM_FIELDS.filter((item) => item.savable).map((item) => item.label);
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

    const values = fields.reduce<Record<string, FieldData>>((acc, cur, i) => {
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

    customerResult[customerResult.length - 1].skuInfos.push({
      uidKey: values[gf3]?.value || '',
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

export function calculateRebateAmtAndBalance(
  customerInfos: CustomeInfo[],
  customFieldsData: NormalizedArtifacts,
): NormalizedArtifacts {
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
      const artifactValue = {
        ...result[customerInfo.customer].value[skuInfo.uidKey],
      };
      artifactValue['Rebate Amount'] =
        (artifactValue['FG/CD'] === 'Cash Discount (CD)'
          ? artifactValue['Rebate Product Qty']
          : artifactValue['Rebate Product Qty'] * artifactValue['Selling Price']) || 0;
      balance -= artifactValue['Rebate Amount'];
      artifactValue['Balance'] = balance;
      result[customerInfo.customer].value[skuInfo.uidKey] = artifactValue;
    });
  });

  return result;
}

function encodeArtifactValue(obj: ArtifactValue, filters: Record<string, any>): string {
  const data = Object.values(obj);
  return encodeURIComponent(JSON.stringify({ data, filters }));
}

export function decodeArtifactValue(content: string): ArtifactValue {
  try {
    const { data }: { data: any[] } = JSON.parse(decodeURIComponent(content));
    return data.reduce((acc, cur) => ({ ...acc, [cur[ARTIFACT_VALUE_GROUP_KEY]]: cur }), {});
  } catch (error) {
    console.error('decodeArtifactValue', error);
    return {};
  }
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
  updates: NormalizedArtifacts,
  current: NormalizedArtifacts,
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

    Object.keys(currentSkus).forEach((sku) => {
      let tbdSku = pick({ ...currentSkus[sku], ...changedSkus[sku] }, SAVABLE_FIELDS);
      if (isEmptyObj(tbdSku) || isSubset(tbdSku, DEFAULT_CUSTOM_FIELD_VALUES)) {
        return;
      }
      tbdSku = {
        ...DEFAULT_CUSTOM_FIELD_VALUES,
        ...tbdSku,
      };
      const skuFieldsData = customerData?.skuInfos.find((s) => s.uidKey === sku)?.fieldsData || {};
      Object.keys(skuFieldsData).forEach((fieldName) => {
        if (EXTRA_SAVABLE_FIELDS.some((ef) => fieldName.endsWith(ef))) {
          tbdSku[skuFieldsData[fieldName].label] = skuFieldsData[fieldName].value;
        }
      });
      toBeUpdated[sku] = tbdSku;
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
