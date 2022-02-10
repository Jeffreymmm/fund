import { Component } from 'react'
import { View, Icon } from '@tarojs/components'
import './index.less'
import Taro from '@tarojs/api';
export default class extends Component {

  column = [
    {
      columnName: '基金名称',
      columnCode: 'name',
      width: '230rpx',
    },
    {
      columnName: '净值',
      columnCode: 'dwjz',
      width: '150rpx',
      format: '%',
      isValue: true
    },
    {
      columnName: '估算净值',
      columnCode: 'gszzl',
      width: '150rpx',
      format: '%',
      isValue: true
    },
    {
      columnName: '估算收益',
      columnCode: 'gains',
      width: '150rpx',
      isValue: true
    },
    {
      columnName: '持有额',
      columnCode: 'amount',
      width: '150rpx',
      isValue: true
    },
    {
      columnName: '持有收益',
      columnCode: 'costGains',
      width: '200rpx',
      isValue: true
    },
    {
      columnName: '持有收益率',
      columnCode: 'costGainsRate',
      width: '200rpx',
      format: '%',
      isValue: true
    },


    {
      columnName: '更新时间',
      columnCode: 'gztime',
      width: '280rpx'
    },
  ];

  fundList = [
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
    {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    }, {
      code: '003095',
      num: 5954.10,
      cost: 3.3590
    },
  ]

  dataList = [];

  userId: any = null;


  allGains = 0;

  allGainsRate: any = 0;

  async getFundData() {
    let fundlist = this.fundList.map((val) => val.code).join(",");
    let url =
      "https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=200&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=" +
      this.userId +
      "&Fcodes=" +
      fundlist;
    const res = await Taro.request({ url: url });

    let data = res.data.Datas;
    this.dataList = [];
    let dataList: any = [];
    data.forEach((val) => {
      let data: any = {
        fundcode: val.FCODE,
        name: val.SHORTNAME,
        jzrq: val.PDATE,
        dwjz: isNaN(val.NAV) ? null : val.NAV,
        gsz: isNaN(val.GSZ) ? null : val.GSZ,
        gszzl: isNaN(val.GSZZL) ? 0 : val.GSZZL,
        gztime: val.GZTIME,
      };
      if (val.PDATE != "--" && val.PDATE == val.GZTIME.substr(0, 10)) {
        data.gsz = val.NAV;
        data.gszzl = isNaN(val.NAVCHGRT) ? 0 : val.NAVCHGRT;
        data.hasReplace = true;
      }

      let slt = this.fundList.filter(
        (item) => item.code == data.fundcode
      );
      data.num = slt[0].num;
      data.cost = slt[0].cost;
      data.amount = this.calculateMoney(data);
      data.gains = this.calculate(data, data.hasReplace);
      data.costGains = this.calculateCost(data);
      data.costGainsRate = this.calculateCostRate(data);

      // if (data.fundcode == this.RealtimeFundcode) {
      //   if (this.showBadge == 1) {
      //     if (this.BadgeContent == 1) {
      //       chrome.runtime.sendMessage({
      //         type: "refreshBadge",
      //         data: data,
      //       });
      //     }
      //   }
      // }

      dataList.push(data);
    });

    this.dataList = dataList;
    console.log(this.dataList);
    this.getAllGains();
    this.setState({ dataList: this.dataList });
  }

  getGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  calculateMoney(val) {
    let sum = (val.dwjz * val.num).toFixed(2);
    return sum;
  }
  calculate(val, hasReplace) {
    let sum: any = 0;
    let num = val.num ? val.num : 0;
    if (hasReplace) {
      sum = ((val.dwjz - val.dwjz / (1 + val.gszzl * 0.01)) * num).toFixed(2);
    } else {
      if (val.gsz) {
        sum = ((val.gsz - val.dwjz) * num).toFixed(2);
      }
    }
    return sum;
  }
  calculateCost(val) {
    if (val.cost) {
      let sum = ((val.dwjz - val.cost) * val.num).toFixed(2);
      return sum;
    } else {
      return 0;
    }
  }
  calculateCostRate(val) {
    if (val.cost && val.cost != 0) {
      let sum = (((val.dwjz - val.cost) / val.cost) * 100).toFixed(2);
      return sum;
    } else {
      return 0;
    }
  }

  getAllGains() {
    let allGains: any = 0;
    let allNum = 0;
    this.dataList.forEach((val: any) => {
      allGains += parseFloat(val.gains);
      allNum += parseFloat(val.amount);
    });
    allGains = allGains.toFixed(2);
    let allGainsRate = ((allGains * 100) / allNum).toFixed(2);


    this.allGains = allGains;
    this.allGainsRate = allGainsRate;

    this.setState({ allGains: this.allGains, allGainsRate: this.allGainsRate });
  }

  componentWillMount() {
    this.userId = this.getGuid();
    this.getFundData();

  }

  componentDidMount() {
  }

  componentWillUnmount() { }

  componentDidShow() {
  }

  componentDidHide() { }

  render() {
    return (
      <View className="components-page">
        <View className="table_wrap">
          <View className="thead">
            <View className="tr">
              {this.column.map(item => {
                return <View className={item.columnCode === 'name' ? 'leftHeader th' : 'rightHeader th'} style={{ width: item.width }}  >{item.columnName}</View>
              })}
            </View>
          </View>

          {this.dataList.map((item: any) => {
            return <View className="tr">
              {this.column.map(columnItem => {
                return <View style={{ width: columnItem.width }} className={(columnItem.columnCode === 'name' ? 'leftTd td' : 'right td')} >
                  <View className={(columnItem.isValue ? item[columnItem.columnCode] > 0 ? 'up' : 'down' : '')}>
                    {item[columnItem.columnCode]} {columnItem.format ? columnItem.format : ''}
                  </View>
                </View>
              })}
            </View>
          })
          }
        </View >

        <View className="bottomRow">
          <View className="bottomRow-left">
            <View className="leftIcon iconfont iconcaozuojilu"></View>
            <View className="leftIcon iconfont iconxiai"></View>
            <View className="leftIcon iconfont iconshezhi"></View>
          </View>
          <View className="bottomRow-right">
            <View>
              <View>当前收益</View>
              <View className={this.allGains >= 0 ? 'btn-up' : 'btn-down'} >{this.allGains}</View>
            </View>
            <View className="iconfont iconyoubian rightIcon"></View>
          </View>
        </View>
      </View>)
  }
}
