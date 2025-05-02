const UNIQUE_IDENTIFIER_FIELD_NAME = 'rebate_to_sku';
const GROUP_FIELD1_NAME = 'rebate_to_customer';
const GROUP_FIELD1B_NAME = 'weighted_outstanding_rebate';
const GROUP_FIELD2_NAME = 'rebate_to_category';

export type Field = {
  label: string;
  name: string;
  isCustom?: boolean;
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

export type SkuData = {
  mainGroup: string;
  uidKey: string;
  woRebate: number;
  fieldsData: FieldData[];
};

export const customFields: Field[] = [
  {
    label: 'FG/CD',
    name: 'fg_cd',
    isCustom: true,
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
    isCustom: true,
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
  },
  {
    label: 'Selling Price',
    name: 'selling_price',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
    type: 'inputnumber',
  },
  {
    label: 'Rebate Amount',
    name: 'rebate_amount',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
    type: 'text',
  },
  {
    label: 'Balance',
    name: 'balance',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
    type: 'text',
  },
];

export function sortAndGroupQueryData(data: any[], fields: Field[]): SkuData[] {
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

  const result: SkuData[] = [];

  sortedItems.forEach((item, index) => {
    const cus = item[gf1].value;
    const cat = item[gf2].value;

    if (cus !== lastCus) {
      if (index > 0) {
        result[index - rowSpanMap['cus']].fieldsData[0].rowSpan = rowSpanMap['cus'];
        result[index - rowSpanMap['cus']].fieldsData[1].rowSpan = rowSpanMap['cus'];
      }
      rowSpanMap['cus'] = 1;
      lastCus = cus;
      lastCat = '';
    } else {
      rowSpanMap['cus']++;
    }

    if (cat !== lastCat) {
      if (index > 0) {
        result[index - rowSpanMap['cat']].fieldsData[2].rowSpan = rowSpanMap['cat'];
      }
      rowSpanMap['cat'] = 1;
      lastCat = cat;
    } else {
      rowSpanMap['cat']++;
    }

    const values: FieldData[] = fields.map((f, i) => ({
      name: f.name,
      value: item[f.name] ? item[f.name].value : f.defaultValue,
      rendered: item[f.name] ? item[f.name].rendered || item[f.name].value : f.defaultValue,
      rowSpan: i > 2 ? 1 : 0,
      verticalAlign: i > 2 ? 'middle' : 'top',
      align: f.align,
      isCustom: f.isCustom,
    }));

    result.push({
      mainGroup: cus,
      woRebate: values.find((item) => item.name === gf1b)?.value || 0,
      uidKey: values.find((item) => item.name === gf3)?.value || '',
      fieldsData: values,
    });
  });

  result[sortedItems.length - rowSpanMap['cus']].fieldsData[0].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cus']].fieldsData[1].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cat']].fieldsData[2].rowSpan = rowSpanMap['cat'];

  return result;
}

export function calculateRebateAmtAndBalance(
  skuData: SkuData[],
  artifactsData: Record<string, Record<string, any>>,
): Record<string, Record<string, any>> {
  let balance = 0;
  let lastGroup = '';
  for (let i = 0; i < skuData.length; i++) {
    if (lastGroup !== skuData[i].mainGroup) {
      if (!artifactsData[skuData[i].mainGroup]) {
        artifactsData[skuData[i].mainGroup] = {};
      }
      if (!artifactsData[skuData[i].mainGroup][skuData[i].uidKey]) {
        artifactsData[skuData[i].mainGroup][skuData[i].uidKey] = {};
      }
      balance = skuData[i].woRebate;
    }
    lastGroup = skuData[i].mainGroup;
    const artifactValue = artifactsData[skuData[i].mainGroup][skuData[i].uidKey];
    artifactValue['rebate_amount'] =
      (artifactValue['fg_cd'] === 'CD'
        ? artifactValue['rebate_product_qty']
        : artifactValue['rebate_product_qty'] * artifactValue['selling_price']) || 0;
    balance -= artifactValue['rebate_amount'];
    artifactValue['balance'] = balance;
  }
  return artifactsData;
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
