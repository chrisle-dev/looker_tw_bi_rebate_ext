function sortAndGroupQueryData(data, fields) {
  const sortedItems = data.sort((a, b) => {
    const ka = a[fields[0].name].value + '_' + a[fields[2].name].value;
    const kb = b[fields[0].name].value + '_' + b[fields[2].name].value;
    return ka.localeCompare(kb);
  });

  let lastCus = '';
  let lastCat = '';
  const rowSpanMap = {
    cus: 0,
    cat: 0,
  };

  const result = [];

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

    const values = fields.map((f, i) => ({
      name: f.name,
      value: item[f.name].value,
      rendered: item[f.name].rendered || item[f.name].value,
      rowSpan: i > 2 ? 1 : 0,
    }));

    result.push(values);
  });
  result[sortedItems.length - rowSpanMap['cus']][0].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cus']][1].rowSpan = rowSpanMap['cus'];
  result[sortedItems.length - rowSpanMap['cat']][2].rowSpan = rowSpanMap['cat'];

  return result;
}

const fields = [
  {
    label: 'Rebate to Customer',
    name: 'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer',
  },
  {
    label: 'Weighted Outstanding Rebate',
    name: 'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate',
  },
  {
    label: 'Rebate to Category',
    name: 'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category',
  },
];

const data = [
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '114370 TRAJENTA 5MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '116520 GLYXAMBI 25 MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 748009.5,
      rendered: '748,009.5',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '184172 ACTILYSE 1VIAL -I',
      filterable_value: '"184172 ACTILYSE 1VIAL -I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.0897303152198965,
      rendered: '9.0%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: ' ',
      filterable_value: '" "',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 153373.5,
      rendered: '153,373.5',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '306979 STRIVERDI DOSLI/4ML',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.225027261684565,
      rendered: '22.5%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 3110401.35,
      rendered: '3,110,401.35',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '106730 OFEV CAP 100MG 60',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.03494353644768222,
      rendered: '3.5%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '111484 Praxbind 50mg/2 TW',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.018858730158730186,
      rendered: '1.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 13070957.55,
      rendered: '13,070,957.55',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '304057 GIOTRIF 30MG 28T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.14176066598464598,
      rendered: '14.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302146 MOBIC 15MG 700T RC',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: -1.5243205342407862e-6,
      rendered: '-0.0%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 622657.3500000001,
      rendered: '622,657.3500000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "399685 MIRAPEX 1.0MG 100'S",
      filterable_value: '"399685 MIRAPEX 1.0MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.21679153067061463,
      rendered: '21.7%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 171496.5,
      rendered: '171,496.5',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302267 ATROVENT UDV 20V-I',
      filterable_value: '"302267 ATROVENT UDV 20V-I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.3341002912319394,
      rendered: '33.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302148 CATAPRES 100T BLI',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '114094 JARDIANCE 10MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 7174651.05,
      rendered: '7,174,651.05',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '156580 GLYXAMBI 25 MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.2091064466061805,
      rendered: '20.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 177286.20000000004,
      rendered: '177,286.20000000004',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '398558 BEROTEC HFA 10ML',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.13726805740553083,
      rendered: '13.7%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 421188.60000000003,
      rendered: '421,188.60000000003',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '168202 SPEVIGO INVIV 75ML 2 60MG',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.05399394617418052,
      rendered: '5.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 538318.2000000001,
      rendered: '538,318.2000000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302988 Combivent UDV 20V-I',
      filterable_value: '"302988 Combivent UDV 20V-I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.3608463783962278,
      rendered: '36.1%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 1148779.8,
      rendered: '1,148,779.8',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '110326 SPIOLTO 4ML',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.14365272820148856,
      rendered: '14.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 488567.1000000001,
      rendered: '488,567.1000000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "303964 PRADAXA CAP 150MG 60'S",
      filterable_value: '"303964 PRADAXA CAP 150MG 60\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.28356524792570037,
      rendered: '28.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 919871.4,
      rendered: '919,871.4',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '146786 JARDIANCE 10MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.21635225951681292,
      rendered: '21.6%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301774 MIRAPEX 1.5MG 100'S",
      filterable_value: '"301774 MIRAPEX 1.5MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 1271585.7000000002,
      rendered: '1,271,585.7000000002',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "125654 MIRAPEX 1.5MG 100'S",
      filterable_value: '"125654 MIRAPEX 1.5MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.2221674630078423,
      rendered: '22.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '114095 JARDIANCE 25MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 773816.4,
      rendered: '773,816.4',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "125652 MIRAPEX 0.375MG 100'S",
      filterable_value: '"125652 MIRAPEX 0.375MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.19889413668064082,
      rendered: '19.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 8883453.6,
      rendered: '8,883,453.6',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '304056 GIOTRIF 40MG 28T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.11977711523211121,
      rendered: '12.0%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 1884674.4000000001,
      rendered: '1,884,674.4000000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '146787 JARDIANCE 25MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.28194232038046885,
      rendered: '28.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '304635 VIRAMUNE 400MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 3317932.8,
      rendered: '3,317,932.8',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '121289 TRAJENTA 5MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.21945869099198978,
      rendered: '21.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 1592810.0999999999,
      rendered: '1,592,810.0999999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301349 SPIRIVA RMT 1'S",
      filterable_value: '"301349 SPIRIVA RMT 1\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.19901920353408986,
      rendered: '19.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 837088.3500000001,
      rendered: '837,088.3500000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301081 PRADAXA CAP 110MG 60'S",
      filterable_value: '"301081 PRADAXA CAP 110MG 60\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.1866464679498313,
      rendered: '18.7%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '921216 PERSANTIN INJ 25A',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301770 MIRAPEX 0.375MG 100'S",
      filterable_value: '"301770 MIRAPEX 0.375MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '920127 ACTILYSE 1VIAL -I',
      filterable_value: '"920127 ACTILYSE 1VIAL -I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010001 台大醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 9578441.250000002,
      rendered: '9,578,441.250000002',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '106731 OFEV CAP 150MG 60',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.09633738872332798,
      rendered: '9.6%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 561202.9500000001,
      rendered: '561,202.9500000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '121289 TRAJENTA 5MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 961585.6511575187,
      rendered: '961,585.6511575187',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.21945869099198978,
      rendered: '21.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 157569.30000000002,
      rendered: '157,569.30000000002',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "125654 MIRAPEX 1.5MG 100'S",
      filterable_value: '"125654 MIRAPEX 1.5MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 487924.6971437745,
      rendered: '487,924.6971437745',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.2221674630078423,
      rendered: '22.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302148 CATAPRES 100T BLI',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "303572 853901562) Twynsta Tab 80/5mg 28'S/Bx",
      filterable_value: '"303572 853901562) Twynsta Tab 80/5mg 28\'S/Bx"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 281350.64999999997,
      rendered: '281,350.64999999997',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '110326 SPIOLTO 4ML',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 923495.9255007197,
      rendered: '923,495.9255007197',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.14365272820148856,
      rendered: '14.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 8615.25,
      rendered: '8,615.25',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301082 PRADAXA CAP 75MG 60'S",
      filterable_value: '"301082 PRADAXA CAP 75MG 60\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 16895.903727077508,
      rendered: '16,895.903727077508',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.18355377906976733,
      rendered: '18.4%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 250453.35,
      rendered: '250,453.35',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301081 PRADAXA CAP 110MG 60'S",
      filterable_value: '"301081 PRADAXA CAP 110MG 60\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 997870.2858508195,
      rendered: '997,870.2858508195',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.1866464679498313,
      rendered: '18.7%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '184172 ACTILYSE 1VIAL -I',
      filterable_value: '"184172 ACTILYSE 1VIAL -I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.0897303152198965,
      rendered: '9.0%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 200580.45,
      rendered: '200,580.45',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '122481 TWYNSTA 80+5MG 28T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 1051749.355197144,
      rendered: '1,051,749.355197144',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.299080464014701,
      rendered: '29.9%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 3618.3,
      rendered: '3,618.3',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '302988 Combivent UDV 20V-I',
      filterable_value: '"302988 Combivent UDV 20V-I"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 6871.98710722323,
      rendered: '6,871.98710722323',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.3608463783962278,
      rendered: '36.1%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 803997.6000000001,
      rendered: '803,997.6000000001',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '148779 JD DUO 12.5+850MG 60T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.23984368131735423,
      rendered: '24.0%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '306979 STRIVERDI DOSLI/4ML',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.225027261684565,
      rendered: '22.5%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: "301770 MIRAPEX 0.375MG 100'S",
      filterable_value: '"301770 MIRAPEX 0.375MG 100\'S"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: null,
      filterable_value: 'NULL',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'DM',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 515479.65,
      rendered: '515,479.65',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '146787 JARDIANCE 25MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 0,
      filterable_value: '0.0',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.28194232038046885,
      rendered: '28.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 543529.35,
      rendered: '543,529.35',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '304057 GIOTRIF 30MG 28T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 1570872.6293023778,
      rendered: '1,570,872.6293023778',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.14176066598464598,
      rendered: '14.2%',
    },
  },
  {
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_customer': {
      value: '010002 長庚台北醫院',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.weighted_outstanding_rebate': {
      value: 104401.13249999999,
      rendered: '104,401.13249999999',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_category': {
      value: 'Non-DM',
      filterable_value: '"Non-DM"',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_amt_limit': {
      value: 224802.9,
      rendered: '224,802.9',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_planning_alert_1': {
      value: '\u003e1 Contract selected: Untick [DO NOT SELECT] option in filters',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.rebate_to_sku': {
      value: '118699 MICARDIS 80MG 30T',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.recommended_rebate_amt': {
      value: 1271576.2529238136,
      rendered: '1,271,576.2529238136',
    },
    'zanalyticstw_bi_rebate_consolidate_v3.cd_percent_total': {
      value: 0.3091421695451395,
      rendered: '30.9%',
    },
  },
];

console.log(sortAndGroupQueryData(data, fields).slice(34));
