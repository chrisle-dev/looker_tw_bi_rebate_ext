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
  CUSTOM_FIELDS,
  HIDDEN_FIELDS,
  Field,
  CustomerInfo,
  CheckBalanceAll,
  CheckBalanceEach,
  NamespaceArtifactValues,
  InputType,
  calculateSavedArtifactValues,
  sortAndGroupQueryData,
  getSavableArtifacts,
  decodeArtifactValue,
  getFilteredObject,
  encodeFilteredObject,
  chunk,
  updateCheckBalanceAll,
  debounce,
  sha256,
} from './HandleData';

const enum SaveState {
  Unsaved = 'unsaved',
  Saving = 'saving',
  Saved = 'saved',
}

function formatBalance(value: number) {
  return Math.round(value).toLocaleString();
}

const RebateTable = () => {
  const { extensionSDK, visualizationData, coreSDK, tileHostData } = useContext(ExtensionContext40);
  const [fields, setFields] = useState<Field[]>([]);
  const [userInfo, setUserInfo] = useState<IUser>();
  const [customerInfos, setCustomerInfos] = useState<CustomerInfo[]>([]);
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
      contractGroup: '',
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

  const calculateBalances = (
    customerInfo: CustomerInfo,
    uid: string,
    data: Record<string, any>,
    cb: (newValue: Record<string, any>) => void,
  ) => {
    const { artifactValues, checkBalanceValues } = calculateSavedArtifactValues([customerInfo], {
      [customerInfo.customer]: { value: data, version: -1 },
    });
    recalculateCheckBalance(customerInfo.customer, checkBalanceValues[customerInfo.customer]);
    saveRefArtifacts(customerInfo.customer, uid, data[uid]);
    cb(artifactValues[customerInfo.customer].value);
  };

  const calculateBalancesDebounced = debounce(calculateBalances, 500);

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
    console.log('visualizationData?.queryResponse', visualizationData?.queryResponse);
    const displayedFields: Field[] = [
      ...visualizationData.queryResponse.fields['dimensions'],
      ...visualizationData.queryResponse.fields['measures'],
    ].map<Field>((item) => ({
      label: item['label_short'],
      name: item['name'],
      align: item['align'],
      hidden: HIDDEN_FIELDS.includes(item['name']),
    }));
    const custInfo = sortAndGroupQueryData(visualizationData.queryResponse.data, displayedFields);
    const username = String(userInfo.email).split('@')[0];
    setFields(displayedFields);
    setCustomerInfos(custInfo);
    setArtifactKeys(custInfo.map((item) => item.customer).join(','));
    const encodedFilter = encodeFilteredObject(visualizationData.queryResponse.applied_filters);
    sha256(encodedFilter).then((hashedFilter) => {
      const namespace = `tw_bi_rebate_ext_${username}_${userInfo.id}_${tileHostData.dashboardId}_${tileHostData.elementId}_${hashedFilter}`;
      setArtifactNS(namespace);
    });
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
                    calculateBalances={calculateBalancesDebounced}
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

function formatAmount(input: string): string {
  if (!input) return '';
  const negativePrefix = input.startsWith('-') ? '-' : '';
  const point = input.indexOf('.') > -1 ? '.' : '';
  const [int, frac] = input.replace(/[^\d.]/g, '').split('.');
  return `${negativePrefix}${int ? Number(int).toLocaleString() : ''}${point}${frac || ''}`;
}

function amountNumber(input: string | number): number {
  if ('number' === typeof input) {
    return input;
  }
  if (input.endsWith('.')) {
    input = input.substring(0, input.length - 1);
  }
  input = input.replace(/,/g, '');
  return Number(input) || 0;
}

function normalizeRebateData(data: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {};
  Object.keys(data).forEach((uid: string) => {
    const values = data[uid];
    output[uid] = { ...values };
    Object.keys(values).forEach((fieldName: string) => {
      const field = CUSTOM_FIELDS.find((item) => item.name === fieldName);
      if (field?.type === InputType.Number) {
        output[uid][fieldName] = amountNumber(values[fieldName]);
      }
    });
  });

  return output;
}

const RebateToCustomer = memo(function RebateToCustomer({
  fields,
  customerInfo,
  savedData,
  calculateBalances,
}: {
  fields: Field[];
  customerInfo: CustomerInfo;
  savedData: Record<string, any>;
  calculateBalances: (
    customer: CustomerInfo,
    uid: string,
    data: Record<string, any>,
    cb: (newValue: Record<string, any>) => void,
  ) => void;
}) {
  const [localValues, setLocalValues] = useState(savedData);

  useEffect(() => {
    setLocalValues(savedData);
  }, [savedData]);

  const saveDataLocal = (uid: string, field: Field, data: Record<string, any>) => {
    const isNumber = field.type === InputType.Number;
    const fieldName = field.name;
    if (isNumber) {
      const v = formatAmount(data[fieldName]);
      data[fieldName] = v;
    }
    const newData = { ...localValues };
    newData[uid] = {
      ...newData[uid],
      ...data,
    };
    setLocalValues(newData);
    calculateBalances(customerInfo, uid, normalizeRebateData(newData), function (newValue: Record<string, any>) {
      if (newValue) {
        newValue = {
          ...newValue,
          [uid]: {
            ...newValue[uid],
            [fieldName]: data[fieldName],
          },
        };
        setLocalValues(newValue);
      }
    });
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
              minWidth={f.minWidth}
              maxWidth={f.maxWidth}
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
  saveDataLocal: (uid: string, field: Field, data: Record<string, any>) => void;
}) => {
  const localValue = data?.[field.name] ?? field.defaultValue;
  const rendered = field.render ? field.render(localValue) : localValue;

  return (
    <>
      {field.type === InputType.Text && <Span>{rendered}</Span>}
      {field.type === InputType.Select && (
        <Select
          minWidth={100}
          value={localValue}
          options={field.options}
          onChange={(value) => saveDataLocal(uid, field, { [field.name]: value })}
        />
      )}
      {field.type === InputType.Number && (
        <InputText
          type="text"
          minWidth={100}
          value={localValue}
          onChange={(e) => saveDataLocal(uid, field, { [field.name]: e.target.value })}
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
