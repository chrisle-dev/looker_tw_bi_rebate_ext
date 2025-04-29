// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useContext, useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableDataCell,
  Select,
  InputText,
  Space,
  Span,
} from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import './RebateTable.scss';

const UNIQUE_IDENTIFIER_FIELD_NAME = 'rebate_to_sku';
const GROUP_FIELD1_NAME = 'rebate_to_customer';
const GROUP_FIELD2_NAME = 'rebate_to_category';

type Field = {
  label: string;
  name: string;
  isCustom?: boolean;
  align?: any;
  defaultValue?: any;
  type?: 'select' | 'inputnumber' | 'text';
  options?: { label: string; value: any }[];
};

type DataItem = {
  name: string;
  value: any;
  rendered: any;
  rowSpan: number;
  align?: any;
  verticalAlign?: any;
  isCustom?: boolean;
};

const customFields: Field[] = [
  {
    label: 'FG/CD',
    name: 'fg_cd',
    isCustom: true,
    defaultValue: 'fg',
    align: 'left',
    type: 'select',
    options: [
      {
        label: 'Free Goods (FG)',
        value: 'fg',
      },
      {
        label: 'Cash Discount (CD)',
        value: 'cd',
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

function sortAndGroupQueryData(data: any[], fields: Field[]): DataItem[][] {
  const gf1 = String(fields.find((f) => f.name.endsWith(GROUP_FIELD1_NAME))?.name);
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

  const result: DataItem[][] = [];

  sortedItems.forEach((item, index) => {
    const cus = item[fields[0].name].value;
    const cat = item[fields[2].name].value;

    if (cus !== lastCus) {
      if (index > 0) {
        result[index - rowSpanMap['cus']][0].rowSpan = rowSpanMap['cus'];
        result[index - rowSpanMap['cus']][1].rowSpan = rowSpanMap['cus'];
      }
      rowSpanMap['cus'] = 1;
      lastCus = cus;
      lastCat = '';
    } else {
      rowSpanMap['cus']++;
    }

    if (cat !== lastCat) {
      if (index > 0) {
        result[index - rowSpanMap['cat']][2].rowSpan = rowSpanMap['cat'];
      }
      rowSpanMap['cat'] = 1;
      lastCat = cat;
    } else {
      rowSpanMap['cat']++;
    }

    const values: DataItem[] = fields.map((f, i) => ({
      name: f.name,
      value: item[f.name] ? item[f.name].value : f.defaultValue,
      rendered: item[f.name] ? item[f.name].rendered || item[f.name].value : f.defaultValue,
      rowSpan: i > 2 ? 1 : 0,
      verticalAlign: i > 2 ? 'middle' : 'top',
      align: f.align,
      isCustom: f.isCustom,
    }));
    result.push(values);
  });

  result[sortedItems.length - rowSpanMap['cus']][0].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cus']][1].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cat']][2].rowSpan = rowSpanMap['cat'];

  return result;
}

function getUniqueRebateCustomers(data: any[], key: string): string[] {
  return Array.from(new Set(data.map((item) => item[key].value)));
}

function safeParseJSONObj(content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn('safeParseJSONObj', error);
    return {};
  }
}

const RebateTable = () => {
  const { extensionSDK, visualizationData, coreSDK, tileHostData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [queryData, setQueryData] = useState<DataItem[][]>([]);
  const [rbtCustomers, setRbtCustomers] = useState<string[]>([]);
  const [savedArtifacts, setSavedArtifacts] = useState<any>({});
  const [artifactNS, setArtifactNS] = useState<string>('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    extensionSDK.rendered();
    const getMe = async () => {
      try {
        const me = await coreSDK.ok(coreSDK.me());
        setArtifactNS(`${me.id}_${tileHostData.dashboardId}_${tileHostData.elementId}`);
      } catch (error) {
        setErrMsg('An error occurred while getting your information. Please try again.');
        console.error('me', error);
      }
    };
    getMe();
  }, []);

  useEffect(() => {
    if (!visualizationData?.queryResponse) return;
    const displayedFields: Field[] = [
      ...visualizationData.queryResponse.fields['dimensions'],
      ...visualizationData.queryResponse.fields['measures'],
    ]
      .map<Field>((item) => ({
        label: item['label_short'],
        name: item['name'],
        align: item['align'],
        isCustom: false,
      }))
      .concat(customFields);
    setRbtCustomers(getUniqueRebateCustomers(visualizationData.queryResponse.data, displayedFields[0].name));
    setFields(displayedFields);
    setQueryData(sortAndGroupQueryData(visualizationData.queryResponse.data, displayedFields));
  }, [visualizationData]);

  useEffect(() => {
    if (!artifactNS || !rbtCustomers.length) return;
    console.log('artifactNS', artifactNS);
    console.log('rbtCustomers', rbtCustomers);
    setSavedArtifacts({});
    const getSavedArtifacts = async () => {
      try {
        const artifacts = await coreSDK.ok(
          coreSDK.artifact({ namespace: artifactNS, key: rbtCustomers.join(','), fields: 'key,value' }),
        );
        console.log('artifacts', artifacts);
        const reduced = artifacts.reduce((acc, cur) => ({ ...acc, [cur.key]: safeParseJSONObj(cur.value) }), {});
        console.log('reduced artifacts', reduced);
        setSavedArtifacts(reduced);
      } catch (error) {
        setErrMsg('An error occurred while getting artifacts. Please try again.');
        console.error('artifacts', error);
      }
    };
    getSavedArtifacts();
  }, [artifactNS, rbtCustomers]);

  return (
    <Box p="u4">
      {errMsg ? (
        <Space align="center" justify="center">
          <Span fontSize="xxlarge">{errMsg}</Span>
        </Space>
      ) : (
        <Table className="rebate-table">
          <TableHead>
            {fields.map((f) => (
              <TableHeaderCell p="u1" textAlign={f.align} border>
                {f.label}
              </TableHeaderCell>
            ))}
            <TableHeaderCell p="u1" textAlign="center" border>
              Action
            </TableHeaderCell>
          </TableHead>
          <TableBody fontSize={'xsmall'}>
            {queryData.map((dataItems) => (
              <TableRow>
                {dataItems
                  .filter((item) => item.rowSpan > 0 && !item.isCustom)
                  .map((item) => (
                    <TableDataCell
                      border
                      p="u1"
                      textAlign={item.align}
                      verticalAlign={item.verticalAlign || 'middle'}
                      rowSpan={item.rowSpan}
                    >
                      {item.rendered}
                    </TableDataCell>
                  ))}
                {customFields.map((f) => (
                  <TableDataCell border p="u1" textAlign={f.align} verticalAlign="middle">
                    <CustomField field={f} rowValues={dataItems} data={savedArtifacts[dataItems[0].value]} />
                  </TableDataCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

// savedArtifacts: {"010001 台大醫院":{"114094 JARDIANCE 10MG 30T":{"fg_cd":"fg"}}}

const CustomField = ({ field, rowValues, data }: { field: Field; rowValues: DataItem[]; data: any }) => {
  const key = rowValues.find((item) => item.name.endsWith(UNIQUE_IDENTIFIER_FIELD_NAME))?.name || '';
  const initValue = data[key]?.[field.name] ?? field.defaultValue;
  return (
    <>
      {field.type === 'text' && <Span>{initValue}</Span>}
      {field.type === 'select' && <Select value={initValue} options={field.options} />}
      {field.type === 'inputnumber' && <InputText value={initValue} type="number" min={0} />}
    </>
  );
};

export default RebateTable;
