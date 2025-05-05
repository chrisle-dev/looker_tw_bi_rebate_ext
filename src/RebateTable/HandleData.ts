import { IUpdateArtifact } from '@looker/sdk';

const UNIQUE_IDENTIFIER_FIELD_NAME = 'rebate_to_sku';
const GROUP_FIELD1_NAME = 'rebate_to_customer';
const GROUP_FIELD1B_NAME = 'weighted_outstanding_rebate';
const GROUP_FIELD2_NAME = 'rebate_to_category';

export type Field = {
  label: string;
  name: string;
  align?: any;
  defaultValue?: any;
  type?: 'select' | 'inputnumber' | 'text';
  options?: { label: string; value: any }[];
  savable?: boolean;
};

export type FieldData = {
  name: string;
  value: any;
  rendered: any;
  rowSpan: number;
  align?: any;
  verticalAlign?: any;
  isCustom?: boolean;
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

export type NormalizedArtifacts = Record<string, { value: Record<string, any>; version: number }>;

export const CUSTOM_FIELDS: Field[] = [
  {
    label: 'FG/CD',
    name: 'fg_cd',
    defaultValue: 'FG',
    align: 'left',
    type: 'select',
    options: [
      {
        label: 'Free Goods (FG)',
        value: 'FG',
      },
      {
        label: 'Cash Discount (CD)',
        value: 'CD',
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
  },
  {
    label: 'Balance',
    name: 'balance',
    defaultValue: 0,
    align: 'right',
    type: 'text',
  },
];

export const SAVABLE_FIELDS = CUSTOM_FIELDS.filter((item) => item.savable).map((item) => item.name);

export function sortAndGroupQueryData(data: any[], fields: Field[]): CustomeInfo[] {
  const gf1 = String(fields.find((f) => f.name.endsWith(GROUP_FIELD1_NAME))?.name);
  const gf1b = String(fields.find((f) => f.name.endsWith(GROUP_FIELD1B_NAME))?.name);
  const gf2 = String(fields.find((f) => f.name.endsWith(GROUP_FIELD2_NAME))?.name);
  const gf3 = String(fields.find((f) => f.name.endsWith(UNIQUE_IDENTIFIER_FIELD_NAME))?.name);

  const sortedItems = data.sort((a, b) => {
    const ka = `${a[gf1].value}_${a[gf2].value}_${a[gf3].value}`;
    const kb = `${b[gf1].value}_${b[gf2].value}_${b[gf3].value}`;
    return ka.localeCompare(kb);
  });
  let lastCus = '';
  let lastCat = '';
  const rowSpanMap: { [key: string]: number } = {
    cus: 0,
    cat: 0,
  };

  const customerResult: CustomeInfo[] = [];

  sortedItems.forEach((item, index) => {
    const cus = item[gf1].value;
    const cat = item[gf2].value;
    const woRebate = item[gf1b].value;

    if (cus !== lastCus) {
      if (index > 0) {
        customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['cus'];
        customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['cus'];
      }
      customerResult.push({
        customer: cus,
        woRebate: woRebate || 0,
        skuInfos: [],
      });
      rowSpanMap['cus'] = 1;
      lastCus = cus;
      lastCat = '';
    } else {
      rowSpanMap['cus']++;
    }

    if (cat !== lastCat) {
      const skuLen = customerResult[customerResult.length - 1].skuInfos.length;
      if (skuLen > 0) {
        customerResult[customerResult.length - 1].skuInfos[skuLen - rowSpanMap['cat']].fieldsData[gf2].rowSpan =
          rowSpanMap['cat'];
      } else if (customerResult.length > 1) {
        customerResult[customerResult.length - 2].skuInfos[
          customerResult[customerResult.length - 2].skuInfos.length - rowSpanMap['cat']
        ].fieldsData[gf2].rowSpan = rowSpanMap['cat'];
      }
      rowSpanMap['cat'] = 1;
      lastCat = cat;
    } else {
      rowSpanMap['cat']++;
    }

    const values = fields.reduce<Record<string, FieldData>>(
      (acc, cur, i) => ({
        ...acc,
        [cur.name]: {
          name: cur.name,
          value: item[cur.name] ? item[cur.name].value : cur.defaultValue,
          rendered: item[cur.name] ? item[cur.name].rendered || item[cur.name].value : cur.defaultValue,
          rowSpan: i > 2 ? 1 : 0,
          verticalAlign: i > 2 ? 'middle' : 'top',
          align: cur.align,
        },
      }),
      {},
    );

    customerResult[customerResult.length - 1].skuInfos.push({
      uidKey: values[gf3]?.value || '',
      fieldsData: values,
    });
  });

  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['cus'];
  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['cus'];
  customerResult[customerResult.length - 1].skuInfos[
    customerResult[customerResult.length - 1].skuInfos.length - rowSpanMap['cat']
  ].fieldsData[gf2].rowSpan = rowSpanMap['cat'];

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
      artifactValue['rebate_amount'] =
        (artifactValue['fg_cd'] === 'CD'
          ? artifactValue['rebate_product_qty']
          : artifactValue['rebate_product_qty'] * artifactValue['selling_price']) || 0;
      balance -= artifactValue['rebate_amount'];
      artifactValue['balance'] = balance;
      result[customerInfo.customer].value[skuInfo.uidKey] = artifactValue;
    });
  });

  return result;
}

export function getUniqueRebateCustomers(data: any[], key: string): string[] {
  return Array.from(new Set(data.map((item) => item[key].value)));
}

export function safeParseJSONObj(content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn('safeParseJSONObj', error);
    return {};
  }
}

export function pick(obj: Record<string, any>, paths: string[]): Record<string, any> {
  if (!obj) return {};
  return paths.reduce((acc, cur) => ({ ...acc, [cur]: obj[cur] }), {});
}

// {"010001 台大醫院":{"114094 JARDIANCE 10MG 30T":{"fg_cd":"fg"}}}
export function getSavableArtifacts(
  updates: NormalizedArtifacts,
  current: NormalizedArtifacts,
): Partial<IUpdateArtifact[]> {
  const result: Partial<IUpdateArtifact[]> = [];
  Object.keys(updates).forEach((customer) => {
    const changedSkus = updates[customer].value;
    const currentSkus = current[customer].value;
    const tobeUpdated: Record<string, any> = {};
    Object.keys(changedSkus).forEach((sku) => {
      tobeUpdated[sku] = {
        ...currentSkus?.[sku],
        ...changedSkus[sku],
      };
    });
    result.push({
      key: customer,
      value: JSON.stringify(pick(tobeUpdated, SAVABLE_FIELDS)),
      version: current[customer].version,
    });
  });
  return result;
}
