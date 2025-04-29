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
import { Box, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableDataCell } from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import './RebateTable.scss';

type Field = {
  label: string;
  name: string;
  isCustom?: boolean;
  align?: any;
  defaultValue?: any;
};

type DataItem = {
  name: string;
  value: any;
  rendered: any;
  rowSpan: number;
  align?: any;
  verticalAlign?: any;
};

const customFields: Field[] = [
  {
    label: 'FG/CD',
    name: 'fg_cd',
    isCustom: true,
    defaultValue: 'fg',
    align: 'left',
  },
  {
    label: 'Rebate Product Qty',
    name: 'rebate_product_qty',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
  },
  {
    label: 'Selling Price',
    name: 'selling_price',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
  },
  {
    label: 'Rebate Amount',
    name: 'rebate_amount',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
  },
  {
    label: 'Balance',
    name: 'balance',
    isCustom: true,
    defaultValue: 0,
    align: 'right',
  },
];

function sortAndGroupQueryData(data: any[], fields: Field[]): DataItem[][] {
  const sortedItems = data.sort((a, b) => {
    const ka = a[fields[0].name].value + '_' + a[fields[2].name].value;
    const kb = b[fields[0].name].value + '_' + b[fields[2].name].value;
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
    }));
    result.push(values);
  });

  result[sortedItems.length - rowSpanMap['cus']][0].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cus']][1].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cat']][2].rowSpan = rowSpanMap['cat'];

  console.log('fields', fields);
  console.log('raw data', data);
  console.log('sortAndGroupQueryData', result);

  return result;
}

const RebateTable = () => {
  const { extensionSDK, visualizationData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [queryData, setQueryData] = useState<DataItem[][]>([]);

  useEffect(() => {
    extensionSDK.rendered();
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
    setFields(displayedFields);
    setQueryData(sortAndGroupQueryData(visualizationData.queryResponse.data, displayedFields));
  }, [visualizationData]);

  return (
    <Box p="u4">
      <Table className="rebate-table">
        <TableHead>
          {fields.map((f) => (
            <TableHeaderCell p="u1" textAlign={f.align} border>
              {f.label}
            </TableHeaderCell>
          ))}
        </TableHead>
        <TableBody fontSize={'small'}>
          {queryData.map((dataItems) => (
            <TableRow>
              {dataItems
                .filter((item) => item.rowSpan > 0)
                .map((item) => (
                  <TableDataCell
                    border
                    p="u1"
                    textAlign={item.align}
                    verticalAlign={item.verticalAlign}
                    rowSpan={item.rowSpan}
                  >
                    {item.rendered}
                  </TableDataCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RebateTable;
