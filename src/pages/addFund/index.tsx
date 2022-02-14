import React, { useState, useEffect } from "react";
import { View } from '@tarojs/components'
import Taro from '@tarojs/api';
import './index.less'

const addFundPage = ((props: any) => {
  console.log(props);



  const numsList = Array.from({ length: 9 }, (v, k) => `${k + 1}`);


  const [fundInfo, setFundInfo] = useState({
    code: '',
    num: '',
    cost: '',
  });


  const [selectIndex, setSelectIndex] = useState(1);

  const [searchOptions, setSearchOptions] = useState([]);

  const [isSelect, setIsSelect] = useState(false);

  const [isOpened, setIsOpened] = useState(false);


  const remoteMethod: any = async (query) => {
    if (query !== "") {
      let url =
        "https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?&m=9&key=" +
        query +
        "&_=" +
        new Date().getTime();

      const res = await Taro.request({ url: url });

      if (!res.data.Datas) return;
      let value = Taro.getStorageSync('fundList') || false;
      console.log(res.data.Datas);
      console.log(value);

      let searchOptions = res.data.Datas.filter((val) => {
        let hasCode = false;
        if (value) {
          hasCode = JSON.parse(value).some((currentValue, index, array) => {
            return currentValue.code == val.CODE;
          });
        }
        return !hasCode;
      }).map((val) => {
        console.log(val);

        return {
          value: val.CODE,
          label: val.NAME,
        };
      });
      console.log(searchOptions);

      setSearchOptions(searchOptions);
    } else {
      setSearchOptions([]);
    }
  }



  const addCode = (str) => {
    console.log(str);

    switch (selectIndex) {
      case 1:
        if (fundInfo.code.length >= 6) return;
        fundInfo.code = fundInfo.code += str;

        remoteMethod(fundInfo.code)

        break;
      case 2:
        fundInfo.num = fundInfo.num += str;
        break;
      case 3:
        fundInfo.cost = fundInfo.cost += str;
        break;

    }
    let obj = Object.assign({}, fundInfo)
    setFundInfo(obj)
  }

  const delectCode = () => {
    switch (selectIndex) {
      case 1:
        if (fundInfo.code.length) {
          fundInfo.code = fundInfo.code.substring(0, fundInfo.code.length - 1);
          setIsSelect(false);
          remoteMethod(fundInfo.code)
        }
        break;
      case 2:
        if (fundInfo.num.length) {
          fundInfo.num = fundInfo.num.substring(0, fundInfo.num.length - 1);
        }
        break;
      case 3:
        if (fundInfo.cost.length) {
          fundInfo.cost = fundInfo.cost.substring(0, fundInfo.cost.length - 1);
        }
        break;
    }
    let obj = Object.assign({}, fundInfo)
    setFundInfo(obj)
  }

  const jiantou = (state) => {
    switch (state) {
      case 'up':
        if (selectIndex < 3) {
          setSelectIndex(selectIndex + 1);
        }
        break;
      case 'down':
        if (selectIndex > 1) {
          setSelectIndex(selectIndex - 1);
        }
        break;
    }
  }

  const setCode = () => {

    if (isSelect) {
      try {
        let value = Taro.getStorageSync('fundList')
        console.log(value);
        if (value) {
          let arr = JSON.parse(value);
          arr.push(fundInfo)
          Taro.setStorage({
            key: "fundList",
            data: JSON.stringify(arr)
          })
        } else {
          Taro.setStorage({
            key: "fundList",
            data: JSON.stringify([fundInfo])
          })
        }

        setIsOpened(true);
        setTimeout(() => {
          Taro.redirectTo({
            url: '/pages/index/index',
          })
        }, 500);
      } catch (e) {
        // Do something when catch error
      }
    } else {

    }
  }

  const onSelectFund = (item) => {
    if (item.value.length === 6) {
      fundInfo.code = item.value;
      let obj = Object.assign({}, fundInfo)
      setFundInfo(obj)
      setIsSelect(true);
    }
  }

  return (
    <View>
      <View className="pageContent" style="align-items:center;position:relative;">
        <View className={selectIndex === 1 ? 'fundInputSelect fundInput' : 'fundInput'} onClick={() => { setSelectIndex(1); }} >
          <View className="title">持仓编码</View>
          <View className={fundInfo.code.length ? 'colorBlack valueContent' : 'valueContent'}>
            {fundInfo.code ? fundInfo.code : '必填'}
            {
              (searchOptions.length && !isSelect) ? <View className="option">
                {searchOptions.map((item: any) => {
                  return <View onClick={() => { onSelectFund(item) }} className="option-row">
                    <View className="name">{item.label}</View>
                    <View className="code">{item.value}</View>
                  </View>;
                })}
              </View> : ''
            }
          </View>
        </View>
        <View className={selectIndex === 2 ? 'fundInputSelect fundInput' : 'fundInput'} onClick={() => { setSelectIndex(2); }}  >
          <View className="title">持有份额</View>
          <View className={fundInfo.num.length ? 'colorBlack valueContent' : 'valueContent'}>
            {fundInfo.num ? fundInfo.num : '选填'}
          </View>
        </View>
        <View className={selectIndex === 3 ? 'fundInputSelect fundInput' : 'fundInput'} onClick={() => { setSelectIndex(3); }}    >
          <View className="title">成本单价</View>
          <View className={fundInfo.cost.length ? 'colorBlack valueContent' : 'valueContent'}>
            {fundInfo.cost ? fundInfo.cost : '选填'}
          </View>
        </View>
        <View className="keyboard">
          <View className="leftContent">
            {numsList.map(item => {
              return <View className="keyBtn" onClick={() => { addCode(item) }}>
                <View className={`iconS iconfont icon${item}`}></View></View>
            })}
            <View className="keyBtn" onClick={() => { addCode('.') }}> .</View>
            <View className="keyBtn" onClick={() => { addCode('0') }}>
              <View className="iconS iconfont icon0"></View>
            </View>
            <View className="keyBtn" onClick={() => { delectCode() }}>
              <View className="iconS iconfont iconqingchu"></View>
            </View>
          </View>
          <View className="rightContent">
            <View onClick={() => { jiantou('down') }} className="keyBtn" style="width:95%;margin: 10rpx 5rpx  0  0px;" >

              <View className="iconS iconfont iconshangjiantou"></View>
            </View>
            <View onClick={() => { jiantou('up') }} className="keyBtn" style="width:95%;margin: 10rpx 5rpx  0  0px;" >
              <View className="iconS iconfont iconxiajiantou"></View>
            </View>
            <View className="sumbit" onClick={() => { setCode() }} >
              <View className="iconS iconfont iconkuangzhonggou"></View>
            </View>
          </View>
        </View>
      </View>

      {
        isOpened ? <View className="toast">添加成功!</View> : ''
      }

    </View>
  );
});

export default addFundPage;
