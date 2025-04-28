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

import React, { useCallback, useEffect, useContext, useState } from 'react';
import { Box, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableDataCell } from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import './RebateTable.scss';

type Field = {
  label: string;
  name?: string;
};

const extraFields: Field[] = [
  {
    label: 'FG/CD',
  },
  {
    label: 'Rebate Product Qty',
  },
  {
    label: 'Selling Price',
  },
  {
    label: 'Rebate Amount',
  },
  {
    label: 'Balance',
  },
];

const RebateTable = () => {
  const { extensionSDK, visualizationData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [queryData, setQueryData] = useState<any[]>([]);

  useEffect(() => {
    extensionSDK.rendered();
  }, []);

  useEffect(() => {
    if (!visualizationData?.queryResponse) return;
    setFields(
      [
        ...visualizationData.queryResponse.fields['dimensions'],
        ...visualizationData.queryResponse.fields['measures'],
      ].map((item) => ({
        label: item['label_short'],
        name: item['name'],
      })),
    );
    setQueryData(visualizationData.queryResponse.data);
  }, [visualizationData]);

  return (
    <Box p="u4">
      <Table className="rebate-table">
        <TableHead>
          {[...fields, ...extraFields].map((f) => (
            <TableHeaderCell p="u1" border>
              {f.label}
            </TableHeaderCell>
          ))}
        </TableHead>
        <TableBody fontSize={'small'}>
          {queryData.map((item) => (
            <TableRow>
              {fields.map(
                (f) =>
                  f.name && (
                    <TableDataCell border p="u1">
                      {item[f.name]?.rendered || item[f.name]?.value}
                    </TableDataCell>
                  ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RebateTable;
