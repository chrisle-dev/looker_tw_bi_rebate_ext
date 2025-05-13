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

import React, { useEffect, useContext, useState, memo, useRef, useCallback } from 'react';
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
import { Save as IconSave } from '@styled-icons/material';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import {
  Field,
  CustomeInfo,
  calculateRebateAmtAndBalance,
  CUSTOM_FIELDS,
  getUniqueRebateCustomers,
  safeParseJSONObj,
  sortAndGroupQueryData,
  getSavableArtifacts,
  NormalizedArtifacts,
} from './HandleData';

const RebateTable = () => {
  const { extensionSDK, visualizationData, coreSDK, tileHostData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [customerInfos, setCustomerInfos] = useState<CustomeInfo[]>([]);
  const [rbtCustomers, setRbtCustomers] = useState<string[]>([]);
  const [savedArtifacts, setSavedArtifacts] = useState<NormalizedArtifacts>({});
  const [artifactNS, setArtifactNS] = useState<string>('');
  const [errMsg, setErrMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const artifactsRef = useRef<NormalizedArtifacts>({});

  const saveRefArtifacts = useCallback((customer: string, uid: string, data: Record<string, any>) => {
    artifactsRef.current = {
      ...artifactsRef.current,
      [customer]: {
        value: {
          ...artifactsRef.current[customer]?.value,
          [uid]: {
            ...artifactsRef.current[customer]?.value?.[uid],
            ...data,
          },
        },
        version: -1,
      },
    };
  }, []);

  const updateArtifacts = async () => {
    if (isSaving) return;
    try {
      const data = getSavableArtifacts(artifactsRef.current, savedArtifacts);
      if (!data.length) return;
      setIsSaving(true);
      const res = await coreSDK.ok(coreSDK.update_artifacts(artifactNS, data));
      const newArtifacts = { ...savedArtifacts };
      res.forEach((item) => {
        newArtifacts[item.key] = {
          value: safeParseJSONObj(item.value),
          version: item.version as number,
        };
      });
      const calculated = calculateRebateAmtAndBalance(customerInfos, newArtifacts);
      setSavedArtifacts(calculated);
      artifactsRef.current = {};
    } catch (error) {
      alert('An error occurred while updating data. Please try again.');
      console.error('updateArtifacts', error);
    }
    setIsSaving(false);
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
    ].map<Field>((item) => ({
      label: item['label_short'],
      name: item['name'],
      align: item['align'],
    }));
    setRbtCustomers(getUniqueRebateCustomers(visualizationData.queryResponse.data, displayedFields[0].name));
    setFields(displayedFields);
    setCustomerInfos(sortAndGroupQueryData(visualizationData.queryResponse.data, displayedFields));
  }, [visualizationData]);

  // get artifacts namespace
  useEffect(() => {
    if (!tileHostData?.dashboardId) return;
    const getMe = async () => {
      try {
        const me = await coreSDK.ok(coreSDK.me());
        const username = String(me.email).split('@')[0];
        setArtifactNS(`tw_bi_rebate_ext_${username}${me.id}_${tileHostData.dashboardId}_${tileHostData.elementId}`);
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
    const getSavedArtifacts = async () => {
      try {
        const artifacts = await coreSDK.ok(
          coreSDK.artifact({ namespace: artifactNS, key: rbtCustomers.join(','), fields: 'key,value,version' }),
        );
        const reduced = artifacts.reduce(
          (acc, cur) => ({ ...acc, [cur.key]: { value: safeParseJSONObj(cur.value), version: cur.version } }),
          {},
        );
        const calculated = calculateRebateAmtAndBalance(customerInfos, reduced);
        setSavedArtifacts(calculated);
      } catch (error) {
        setErrMsg('An error occurred while getting artifacts. Please try again.');
        console.error('artifacts', error);
      }
    };
    getSavedArtifacts();
  }, [artifactNS, rbtCustomers]);

  return (
    <Box p="u4" height="100%">
      {errMsg ? (
        <Space align="center" justify="center">
          <Span fontSize="xxlarge" color="critical">
            {errMsg}
          </Span>
        </Space>
      ) : (
        <Box height="100%">
          <Space justify="end" py="u2">
            <Button onClick={updateArtifacts} width={130} disabled={isSaving} iconBefore={<IconSave />}>
              {isSaving ? 'Saving' : 'Save'}
            </Button>
          </Space>
          <Box height="calc(100% - 50px)" overflow="auto">
            <Table className="rebate-table" mt="u2">
              <TableHead>
                <TableRow>
                  {[...fields, ...CUSTOM_FIELDS].map((f) => (
                    <TableHeaderCell p="u1" textAlign={f.align} key={f.name} border bg="ui1">
                      {f.label}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody fontSize={'xsmall'}>
                {customerInfos.map((customerInfo) => (
                  <RebateToCustomer
                    fields={fields}
                    customerInfo={customerInfo}
                    savedData={savedArtifacts[customerInfo.customer]?.value}
                    key={customerInfo.customer}
                    saveArtifactsLocal={saveRefArtifacts}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const RebateToCustomer = memo(function RebateToCustomer({
  fields,
  customerInfo,
  savedData,
  saveArtifactsLocal,
}: {
  fields: Field[];
  customerInfo: CustomeInfo;
  savedData: Record<string, any>;
  saveArtifactsLocal: (customer: string, uid: string, data: Record<string, any>) => void;
}) {
  const [localValues, setLocalValues] = useState(savedData);

  useEffect(() => {
    setLocalValues(savedData);
  }, [savedData]);

  const saveDataLocal = (uid: string, data: Record<string, any>) => {
    const newData = { ...localValues };
    newData[uid] = {
      ...newData[uid],
      ...data,
    };
    const calculated = calculateRebateAmtAndBalance([customerInfo], {
      [customerInfo.customer]: { value: newData, version: -1 },
    });
    setLocalValues(calculated[customerInfo.customer].value);
    saveArtifactsLocal(customerInfo.customer, uid, newData[uid]);
  };

  return (
    <>
      {customerInfo.skuInfos.map((skuInfo) => (
        <TableRow key={`${customerInfo.customer}_${skuInfo.uidKey}`}>
          {fields.map((fItem) =>
            skuInfo.fieldsData[fItem.name].rowSpan ? (
              <TableDataCell
                border
                p="u1"
                textAlign={skuInfo.fieldsData[fItem.name].align}
                verticalAlign={skuInfo.fieldsData[fItem.name].verticalAlign || 'middle'}
                rowSpan={skuInfo.fieldsData[fItem.name].rowSpan}
                key={fItem.name}
              >
                {skuInfo.fieldsData[fItem.name].rendered}
              </TableDataCell>
            ) : (
              <></>
            ),
          )}
          {CUSTOM_FIELDS.map((f) => (
            <TableDataCell
              border
              p="u1"
              textAlign={f.align}
              verticalAlign="middle"
              key={`${customerInfo.customer}_${skuInfo.uidKey}_${f.name}`}
            >
              <CustomField
                field={f}
                uid={skuInfo.uidKey}
                data={localValues?.[skuInfo.uidKey]}
                saveDataLocal={saveDataLocal}
              />
            </TableDataCell>
          ))}
        </TableRow>
      ))}
    </>
  );
});

const CustomField = ({
  field,
  uid,
  data,
  saveDataLocal,
}: {
  field: Field;
  uid: string;
  data: any;
  saveDataLocal: (uid: string, data: Record<string, any>) => void;
}) => {
  const localValue = data?.[field.name] ?? field.defaultValue;
  return (
    <>
      {field.type === 'text' && <Span>{localValue}</Span>}
      {field.type === 'select' && (
        <Select
          width={200}
          value={localValue}
          options={field.options}
          onChange={(value) => saveDataLocal(uid, { [field.name]: value })}
        />
      )}
      {field.type === 'inputnumber' && (
        <InputText
          type="number"
          min={0}
          width={150}
          value={localValue}
          onChange={(e) => saveDataLocal(uid, { [field.name]: Number(e.target.value || 0) })}
        />
      )}
    </>
  );
};

export default RebateTable;
