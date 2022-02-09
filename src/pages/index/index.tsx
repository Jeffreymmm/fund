import { Component } from 'react'
import { View } from '@tarojs/components'
import './index.less'
import Taro from '@tarojs/api';
export default class extends Component {

  column = [

    {
      columnName: '基金名称',
      width: '200rpx'
    },
    {
      columnName: '净值',
      width: '200rpx'
    },
    {
      columnName: '估算净值',
      width: '200rpx'
    },
    {
      columnName: '当日收益',
      width: '200rpx'
    },
    {
      columnName: '持有收益',
      width: '200rpx'
    },
    {
      columnName: '持有收益率',
      width: '200rpx'
    },
    {
      columnName: '持仓金额',
      width: '200rpx'
    },
    {
      columnName: '持仓占比',
      width: '200rpx'
    },
  ];

  fundList = [
    {
      code: '003095',
      num: 0,
      cost: 0
    },
  ]

  dataList = [];

  userId: any = null;

  render() {
    return (
      <View className="table_wrap">
        <View className="thead">
          <View className="tr">
            {this.column.map(item => {
              return <View style={{ width: item.width }} className="th" >{item.columnName}</View>
            })}
          </View>
        </View>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item: any) => {
          return <View className="tr">
            <View className="th" >序号</View>
            <View className="th" >栏目1</View>
            <View className="th" >栏目2</View>
            <View className="th" >栏目3</View>
            <View className="th" >栏目4</View>
            <View className="th" >栏目4</View>
            <View className="th" >栏目4</View>
            <View className="th" >栏目4</View>
            <View className="th" >栏目4</View>
            <View className="th" >栏目4</View>
            <View className="th" >操作</View>
          </View>
        })}
      </View>
    )
  }

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
    console.log(this.dataList );
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
    let sum:any = 0;
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

  componentWillMount() {
    this.userId = this.getGuid();
    this.getFundData();

  }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }
}
