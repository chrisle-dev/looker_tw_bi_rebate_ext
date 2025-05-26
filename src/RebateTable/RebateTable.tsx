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
  MultiFunctionButton,
  ButtonOutline,
} from '@looker/components';
import { Save as IconSave, Check as IconCheck } from '@styled-icons/material';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import {
  Field,
  CustomeInfo,
  calculateRebateAmtAndBalance,
  CUSTOM_FIELDS,
  sortAndGroupQueryData,
  getSavableArtifacts,
  NamespaceArtifactValues,
  HIDDEN_FIELDS,
  decodeArtifactValue,
  getFilteredObject,
  encodeFilteredObject,
} from './HandleData';
import { IUser } from '@looker/sdk';

const enum SaveState {
  Unsaved = 'unsaved',
  Saving = 'saving',
  Saved = 'saved',
}

const RebateTable = () => {
  const { extensionSDK, visualizationData, coreSDK, tileHostData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [userInfo, setUserInfo] = useState<IUser>();
  const [customerInfos, setCustomerInfos] = useState<CustomeInfo[]>([]);
  const [artifactKeys, setArtifactKeys] = useState<string>();
  const [savedArtifacts, setSavedArtifacts] = useState<NamespaceArtifactValues>({});
  const [artifactNS, setArtifactNS] = useState<string>('');
  const [errMsg, setErrMsg] = useState('');
  // const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(SaveState.Unsaved);
  const artifactsRef = useRef<NamespaceArtifactValues>({});

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
    if (saveState === SaveState.Saving || !visualizationData) return;
    try {
      const data = getSavableArtifacts(
        artifactsRef.current,
        savedArtifacts,
        customerInfos,
        getFilteredObject(visualizationData.queryResponse.applied_filters),
      );
      if (!data.length) return;
      setSaveState(SaveState.Saving);
      const res = await coreSDK.ok(coreSDK.update_artifacts(artifactNS, data));
      const newArtifacts = { ...savedArtifacts };
      res.forEach((item) => {
        newArtifacts[item.key] = {
          value: decodeArtifactValue(item.value),
          version: item.version as number,
        };
      });
      const calculated = calculateRebateAmtAndBalance(customerInfos, newArtifacts);
      setSavedArtifacts(calculated);
      artifactsRef.current = {};
      setSaveState(SaveState.Saved);
      setTimeout(() => {
        setSaveState(SaveState.Unsaved);
      }, 3000);
    } catch (error) {
      setSaveState(SaveState.Unsaved);
      alert('An error occurred while updating data. Please try again.');
      console.error('updateArtifacts', error);
    }
  };

  const fetchSavedArtifacts = async (ns: string, keys: string) => {
    try {
      const artifacts = await coreSDK.ok(coreSDK.artifact({ namespace: ns, key: keys, fields: 'key,value,version' }));
      const reduced = artifacts.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.key]: { value: decodeArtifactValue(cur.value), version: cur.version },
        }),
        {},
      );
      const calculated = calculateRebateAmtAndBalance(customerInfos, reduced);
      setSavedArtifacts(calculated);
    } catch (error) {
      setErrMsg('An error occurred while getting artifacts. Please try again.');
      console.error('artifacts', error);
    }
  };

  useEffect(() => {
    const getMe = async () => {
      try {
        const me = await coreSDK.ok(coreSDK.me());
        setUserInfo(me);
      } catch (error) {
        setErrMsg('An error occurred while getting user information. Please try again.');
        console.error('me', error);
      }
    };
    getMe().then(() => {
      extensionSDK.rendered();
    });
  }, []);

  // sort & group query response data
  useEffect(() => {
    if (!visualizationData?.queryResponse || !userInfo) return;
    const displayedFields: Field[] = [
      ...visualizationData.queryResponse.fields['dimensions'],
      ...visualizationData.queryResponse.fields['measures'],
    ].map<Field>((item) => ({
      label: item['label_short'],
      name: item['name'],
      align: item['align'],
      hidden: HIDDEN_FIELDS.some((hf) => item['name'].endsWith(hf)),
    }));
    const custInfo = sortAndGroupQueryData(visualizationData.queryResponse.data, displayedFields);
    const encodedFilter = encodeFilteredObject(visualizationData.queryResponse.applied_filters);
    const username = String(userInfo.email).split('@')[0];
    const namespace = `tw_bi_rebate_ext_${username}_${userInfo.id}_${tileHostData.dashboardId}_${tileHostData.elementId}${encodedFilter}`;
    setFields(displayedFields);
    setCustomerInfos(custInfo);
    setArtifactKeys(custInfo.map((item) => item.customer).join(','));
    setArtifactNS(namespace);
  }, [visualizationData, userInfo]);

  // load savedArtifacts
  useEffect(() => {
    if (!artifactKeys || !artifactNS) return;
    fetchSavedArtifacts(artifactNS, artifactKeys);
  }, [artifactKeys, artifactNS]);

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
            <MultiFunctionButton swap={saveState === SaveState.Saved} alternate={SavedButton}>
              <Button
                onClick={updateArtifacts}
                width={130}
                disabled={saveState === SaveState.Saving}
                iconBefore={<IconSave />}
              >
                {saveState === SaveState.Saving ? 'Saving' : 'Save'}
              </Button>
            </MultiFunctionButton>
          </Space>
          <Box height="calc(100% - 50px)" overflow="auto">
            <Table className="rebate-table" mt="u2">
              <TableHead>
                <TableRow>
                  {[...fields, ...CUSTOM_FIELDS]
                    .filter((f) => !f.hidden)
                    .map((f) => (
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
  const localValue = data?.[field.label] ?? field.defaultValue;
  return (
    <>
      {field.type === 'text' && <Span>{localValue}</Span>}
      {field.type === 'select' && (
        <Select
          width={200}
          value={localValue}
          options={field.options}
          onChange={(value) => saveDataLocal(uid, { [field.label]: value })}
        />
      )}
      {field.type === 'inputnumber' && (
        <InputText
          type="number"
          min={0}
          width={150}
          value={localValue}
          onChange={(e) => saveDataLocal(uid, { [field.label]: Number(e.target.value || 0) })}
        />
      )}
    </>
  );
};

const SavedButton = (
  <ButtonOutline iconBefore={<IconCheck />} width={130}>
    Data Saved
  </ButtonOutline>
);

export default RebateTable;
