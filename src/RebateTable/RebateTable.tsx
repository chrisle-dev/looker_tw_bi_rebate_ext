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
  Button,
} from '@looker/components';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import { IUpdateArtifact } from '@looker/sdk';
import './RebateTable.scss';
import {
  Field,
  SkuData,
  calculateRebateAmtAndBalance,
  customFields,
  getUniqueRebateCustomers,
  safeParseJSONObj,
  sortAndGroupQueryData,
} from './HandleData';

const RebateTable = () => {
  const { extensionSDK, visualizationData, coreSDK, tileHostData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [queryData, setQueryData] = useState<SkuData[]>([]);
  const [rbtCustomers, setRbtCustomers] = useState<string[]>([]);
  const [savedArtifacts, setSavedArtifacts] = useState<Record<string, Record<string, any>>>({});
  const [artifactNS, setArtifactNS] = useState<string>('');
  const [errMsg, setErrMsg] = useState('');

  const updateArtifacts = async (data: Partial<IUpdateArtifact[]>) => {
    try {
      const res = await coreSDK.ok(coreSDK.update_artifacts(artifactNS, data));
      const newArtifacts = { ...savedArtifacts };
      res.forEach((item) => {
        newArtifacts[item.key] = safeParseJSONObj(item.value);
      });
      const calculated = calculateRebateAmtAndBalance(queryData, newArtifacts);
      console.log('calculated artifacts', calculated);
      setSavedArtifacts(calculated);
    } catch (error) {
      alert('An error occurred while updating data. Please try again.');
      console.error('updateArtifacts', error);
    }
  };

  const saveDataLocal = (group: string, uid: string, data: Record<string, any>) => {
    const newArtifacts = { ...savedArtifacts };
    newArtifacts[group] = {
      ...(newArtifacts[group] || {}),
      [uid]: data,
    };
    const calculated = calculateRebateAmtAndBalance(queryData, newArtifacts);
    console.log('calculated artifacts', calculated);
    setSavedArtifacts(calculated);
  };

  useEffect(() => {
    extensionSDK.rendered();
  }, []);

  // sort & group query response data
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
    console.log('visualizationData', visualizationData);
  }, [visualizationData]);

  // get artifacts namespace
  useEffect(() => {
    console.log('tileHostData', tileHostData);
    if (!tileHostData?.dashboardId) return;
    const getMe = async () => {
      try {
        const me = await coreSDK.ok(coreSDK.me());
        setArtifactNS(`tw_bi_rebate_ext_${me.id}_${tileHostData.dashboardId}_${tileHostData.elementId}`);
      } catch (error) {
        setErrMsg('An error occurred while getting your information. Please try again.');
        console.error('me', error);
      }
    };
    getMe();
  }, [tileHostData]);

  // load savedArtifacts
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
        const calculated = calculateRebateAmtAndBalance(queryData, reduced);
        console.log('calculated artifacts', calculated);
        setSavedArtifacts(calculated);
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
        <div>
          <Space justify="end">
            <Button>Save</Button>
          </Space>
          <Box>
            <Table className="rebate-table" mt="u2">
              <TableHead>
                {fields.map((f) => (
                  <TableHeaderCell p="u1" textAlign={f.align} border>
                    {f.label}
                  </TableHeaderCell>
                ))}
              </TableHead>
              <TableBody fontSize={'xsmall'}>
                {queryData.map((skuData) => (
                  <TableRow>
                    {skuData.fieldsData
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
                        <CustomField
                          field={f}
                          uidKey={skuData.uidKey}
                          mainGroup={skuData.mainGroup}
                          data={savedArtifacts[skuData.mainGroup]?.[skuData.uidKey]}
                          saveDataLocal={saveDataLocal}
                        />
                      </TableDataCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </div>
      )}
    </Box>
  );
};

// savedArtifacts: {"010001 台大醫院":{"114094 JARDIANCE 10MG 30T":{"fg_cd":"fg"}}}

const CustomField = ({
  field,
  uidKey,
  mainGroup,
  data,
  saveDataLocal,
}: {
  field: Field;
  uidKey: string;
  mainGroup: string;
  data: any;
  saveDataLocal: (group: string, uid: string, data: Record<string, any>) => void;
}) => {
  data = data || {};
  const initValue = data[field.name] ?? field.defaultValue;
  return (
    <>
      {field.type === 'text' && <Span>{initValue}</Span>}
      {field.type === 'select' && (
        <Select
          width={200}
          textAlign={field.align}
          value={initValue}
          options={field.options}
          onChange={(value) => saveDataLocal(mainGroup, uidKey, { ...data, [field.name]: value })}
        />
      )}
      {field.type === 'inputnumber' && (
        <InputText
          type="number"
          min={0}
          width={150}
          style={{ textAlign: field.align }}
          value={initValue}
          onChange={(e) => saveDataLocal(mainGroup, uidKey, { ...data, [field.name]: Number(e.target.value || 0) })}
        />
      )}
    </>
  );
};

export default RebateTable;
