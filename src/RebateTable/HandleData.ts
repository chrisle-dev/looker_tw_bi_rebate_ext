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

export const customFields: Field[] = [
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
  },
  {
    label: 'Rebate Product Qty',
    name: 'rebate_product_qty',
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
  },
  {
    label: 'Selling Price',
    name: 'selling_price',
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
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

  let result: SkuInfo[] = [];
  const customerResult: CustomeInfo[] = [];

  sortedItems.forEach((item, index) => {
    const cus = item[gf1].value;
    const cat = item[gf2].value;

    if (cus !== lastCus) {
      if (index > 0) {
        result[index - rowSpanMap['cus']].fieldsData[gf1].rowSpan = rowSpanMap['cus'];
        result[index - rowSpanMap['cus']].fieldsData[gf1b].rowSpan = rowSpanMap['cus'];
        customerResult.push({
          customer: lastCus,
          woRebate: result[0].fieldsData[gf1b]?.value || 0,
          skuInfos: result,
        });
        result = [];
      }
      rowSpanMap['cus'] = 1;
      lastCus = cus;
      lastCat = '';
    } else {
      rowSpanMap['cus']++;
    }

    if (cat !== lastCat) {
      if (index > 0) {
        result[index - rowSpanMap['cat']].fieldsData[gf2].rowSpan = rowSpanMap['cat'];
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

    result.push({
      uidKey: values[gf3]?.value || '',
      fieldsData: values,
    });
  });

  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1].rowSpan = rowSpanMap['cus'];
  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf1b].rowSpan = rowSpanMap['cus'];
  customerResult[customerResult.length - 1].skuInfos[0].fieldsData[gf2].rowSpan = rowSpanMap['cat'];

  return customerResult;
}

export function calculateRebateAmtAndBalance(
  customerInfos: CustomeInfo[],
  customFieldsData: Record<string, Record<string, any>>,
): Record<string, Record<string, any>> {
  const result = { ...customFieldsData };
  customerInfos.forEach((customerInfo) => {
    result[customerInfo.customer] = {
      ...result[customerInfo.customer],
    };
    let balance = customerInfo.woRebate;
    customerInfo.skuInfos.forEach((skuInfo) => {
      const artifactValue = {
        ...result[customerInfo.customer][skuInfo.uidKey],
      };
      artifactValue['rebate_amount'] =
        (artifactValue['fg_cd'] === 'CD'
          ? artifactValue['rebate_product_qty']
          : artifactValue['rebate_product_qty'] * artifactValue['selling_price']) || 0;
      balance -= artifactValue['rebate_amount'];
      artifactValue['balance'] = balance;
      result[customerInfo.customer][skuInfo.uidKey] = artifactValue;
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
