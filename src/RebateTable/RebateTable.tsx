/* eslint-disable @typescript-eslint/no-explicit-any */

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
  Divider,
} from '@looker/components';
import { Save as IconSave, Check as IconCheck } from '@styled-icons/material';
import { ExtensionContext40 } from '@looker/extension-sdk-react';
import { IUser } from '@looker/sdk';
import {
  Field,
  CustomeInfo,
  calculateSavedArtifactValues,
  CUSTOM_FIELDS,
  sortAndGroupQueryData,
  getSavableArtifacts,
  NamespaceArtifactValues,
  HIDDEN_FIELDS,
  decodeArtifactValue,
  getFilteredObject,
  encodeFilteredObject,
  chunk,
  CheckBalanceAll,
  CheckBalanceEach,
  updateCheckBalanceAll,
  debounce,
} from './HandleData';

const enum SaveState {
  Unsaved = 'unsaved',
  Saving = 'saving',
  Saved = 'saved',
}

function formatBalance(value: number) {
  return value.toLocaleString();
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
  const [saveState, setSaveState] = useState<SaveState>(SaveState.Unsaved);
  const artifactsRef = useRef<NamespaceArtifactValues>({});
  const [checkBalance, setCheckBalance] = useState<CheckBalanceAll>({
    _all: {
      total: { total: 0, used: 0, remaining: 0 },
      dm: { total: 0, used: 0, remaining: 0 },
      nonDm: { total: 0, used: 0, remaining: 0 },
    },
  });

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
      const { artifactValues, checkBalanceValues } = calculateSavedArtifactValues(customerInfos, newArtifacts);
      setSavedArtifacts(artifactValues);
      setCheckBalance(checkBalanceValues);
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
      const artifacts = await (async () => {
        const keyBatches = chunk(keys.split(','), 10);
        const result = await Promise.all(
          keyBatches.map(async (ks) => {
            return coreSDK.ok(coreSDK.artifact({ namespace: ns, key: ks.join(','), fields: 'key,value,version' }));
          }),
        );
        return result.flat();
      })();
      const reduced = artifacts.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.key]: { value: decodeArtifactValue(cur.value), version: cur.version },
        }),
        {},
      );
      const { artifactValues, checkBalanceValues } = calculateSavedArtifactValues(customerInfos, reduced);
      setSavedArtifacts(artifactValues);
      setCheckBalance(checkBalanceValues);
    } catch (error) {
      setErrMsg('An error occurred while getting artifacts. Please try again.');
      console.error('artifacts', error);
    }
  };

  const recalculateCheckBalance = (customerName: string, changed: CheckBalanceEach) => {
    const newCheckBalance = updateCheckBalanceAll(customerName, checkBalance, changed);
    setCheckBalance(newCheckBalance);
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
          <Space between={true} py="u2">
            <Box border="ui3">
              <Box p="u1" bg="ui1">
                <Span>Check Balance</Span>
              </Box>
              <Divider />
              <Box p="u1">
                <Span>
                  Total Balance = {formatBalance(checkBalance._all.total.total)} -{' '}
                  {formatBalance(checkBalance._all.total.used)} = {formatBalance(checkBalance._all.total.remaining)}
                </Span>
              </Box>
              <Divider />
              <Box p="u1">
                <Span>
                  DM Balance = {formatBalance(checkBalance._all.dm.total)} - {formatBalance(checkBalance._all.dm.used)}{' '}
                  = {formatBalance(checkBalance._all.dm.remaining)}
                </Span>
              </Box>
              <Divider />
              <Box p="u1">
                <Span>
                  Non-DM Balance = {formatBalance(checkBalance._all.nonDm.total)} -{' '}
                  {formatBalance(checkBalance._all.nonDm.used)} = {formatBalance(checkBalance._all.nonDm.remaining)}
                </Span>
              </Box>
            </Box>
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
          <Box height="calc(100% - 120px)" overflow="auto">
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
                    updateCheckBalance={recalculateCheckBalance}
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
  updateCheckBalance,
}: {
  fields: Field[];
  customerInfo: CustomeInfo;
  savedData: Record<string, any>;
  saveArtifactsLocal: (customer: string, uid: string, data: Record<string, any>) => void;
  updateCheckBalance: (customer: string, changed: CheckBalanceEach) => void;
}) {
  const [localValues, setLocalValues] = useState(savedData);

  useEffect(() => {
    setLocalValues(savedData);
  }, [savedData]);

  const calculateBalances = (uid: string, newData: Record<string, any>) => {
    const { artifactValues, checkBalanceValues } = calculateSavedArtifactValues([customerInfo], {
      [customerInfo.customer]: { value: newData, version: -1 },
    });
    updateCheckBalance(customerInfo.customer, checkBalanceValues[customerInfo.customer]);
    setLocalValues(artifactValues[customerInfo.customer].value);
    saveArtifactsLocal(customerInfo.customer, uid, newData[uid]);
  };

  const calculateBalancesDebounced = useCallback(debounce(calculateBalances, 500), [customerInfo]);

  const saveDataLocal = (uid: string, data: Record<string, any>) => {
    const newData = { ...localValues };
    newData[uid] = {
      ...newData[uid],
      ...data,
    };
    setLocalValues(newData);
    calculateBalancesDebounced(uid, newData);
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
  const rendered = field.render ? field.render(localValue) : localValue;

  return (
    <>
      {field.type === 'text' && <Span>{rendered}</Span>}
      {field.type === 'select' && (
        <Select
          minWidth={150}
          value={localValue}
          options={field.options}
          onChange={(value) => saveDataLocal(uid, { [field.name]: value })}
        />
      )}
      {field.type === 'inputnumber' && (
        <InputText
          type="number"
          minWidth={100}
          value={localValue}
          onChange={(e) => saveDataLocal(uid, { [field.name]: Number(e.target.value || 0) })}
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
