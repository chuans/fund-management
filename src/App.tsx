import React from 'react';
import {
    Avatar,
    Button,
    Card,
    Drawer,
    notification,
    Form,
    Input,
    Popconfirm,
    InputNumber,
    List,
    message,
    Modal,
    Switch,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getCache, setCache } from './util';
import 'antd/dist/antd.css';
import './App.scss';

const { ipcRenderer } = window.require('electron');

interface IDataItem {
    // 基金id
    key: string;
    name: string;
    // 基金规模
    fundSize: string;
    // 净值估算时间
    calculatingTime: string;
    // 估算涨幅比例
    calculatingIncrease: string;
    // 估算净值涨幅
    calculatingNetWorthIncrease: string;
    // 估算净值
    calculatingNetWorth: string;
    
    // 单位净值
    unitNetWorth: string;
    // 单位净值比例
    unitNetWorthIncrease: string;
    // 单位净值时间
    unitNetWorthTime: string;
}


class Clock extends React.Component {
    timeId: any = null;
    state = {
        date: new Date(),
    };
    
    render() {
        return <span style={{fontSize:16}}>{this.state.date.toLocaleTimeString()}</span>
    }
    
    componentDidMount() {
        this.timeId = setInterval(() => {
            this.tick();
        }, 1000);
    }
    
    tick() {
        this.setState({
            date: new Date(),
        });
    }
    
    componentWillUnmount() {
        clearInterval(this.timeId);
    }
}


class App extends React.Component {
    state = {
        settingVisible: false,
        isModalVisible: false,
        settingList: [],
        dataList: [],
        curEdit: {},
        // '1' 为添加     '2' 为编辑
        modalType: '1',
        fundKey: '',
    };
    form: FormInstance | any = null;
    
    cacheConfig = getCache('data-config', {});
    cacheData = getCache('data-list', {});
    
    componentDidMount() {
        this.onEventListener();
        if (this.cacheConfig[ 'privacy' ] === undefined) {
            this.cacheConfig = {
                privacy: false,
            };
        }
    }
    
    onEventListener() {
        ipcRenderer.send('web-onload', this.cacheData);
        
        // 监听住进程发来的数据消息
        ipcRenderer.on('data-change', (event: any, dataList: IDataItem[]) => {
            this.updateDate(dataList);
            
            const { tips } = this.cacheConfig;
            
            if (tips) {
                notification.success({
                    message: '数据更新成功',
                    duration: 1.5,
                });
            }
        });
    }
    
    updateDate(dataList: any) {
        const { privacy, simple, tips } = this.cacheConfig;
        const settingList = [ {
            key: 'privacy',
            icon: 'http://img.chuansroom.com/fundManager/privacy.png',
            title: '保护隐私',
            desc: `打开之后，您的基金金额将会以 ** 展示`,
            type: 'switch',
            initValue: this.cacheConfig[ 'privacy' ],
            actions: [ (
                <Switch
                    checkedChildren={ <CheckOutlined/> }
                    unCheckedChildren={ <CloseOutlined/> }
                    defaultChecked={ !!privacy }
                    onChange={ (checked) => {
                        this.cacheConfig.privacy = checked;
                        setCache('data-config', this.cacheConfig);
                        ipcRenderer.send('update-data');
                    } }
                />
            ) ],
        }, {
            key: 'simple',
            icon: 'http://img.chuansroom.com/fundManager/simple.png',
            title: '简单模式',
            desc: `打开之后，只会展示您的预估净值的简易模式`,
            type: 'switch',
            initValue: this.cacheConfig[ 'simple' ],
            actions: [ (
                <Switch
                    checkedChildren={ <CheckOutlined/> }
                    unCheckedChildren={ <CloseOutlined/> }
                    defaultChecked={ !!simple }
                    onChange={ (checked) => {
                        this.cacheConfig.simple = checked;
                        setCache('data-config', this.cacheConfig);
                        ipcRenderer.send('update-data');
                        
                        this.setState({ dataList: dataList.concat([]) });
                    } }
                />
            ) ],
        }, {
            key: 'tips',
            icon: 'http://img.chuansroom.com/fundManager/tips.png',
            title: '更新提示',
            desc: `打开之后，每次数据刷新会有相应的提示`,
            type: 'switch',
            initValue: this.cacheConfig[ 'tips' ],
            actions: [ (
                <Switch
                    checkedChildren={ <CheckOutlined/> }
                    unCheckedChildren={ <CloseOutlined/> }
                    defaultChecked={ !!tips }
                    onChange={ (checked) => {
                        this.cacheConfig.tips = checked;
                        setCache('data-config', this.cacheConfig);
                        ipcRenderer.send('update-data');
                    } }
                />
            ) ],
        } ];
        
        dataList = dataList.map((val: any) => ({ ...val, ...this.cacheData[ val.key ] }));
        
        this.setState({
            settingList,
            dataList,
        });
    }
    
    setVisible(status = false) {
        this.setState({ settingVisible: status });
    }
    
    onHandleEdit = (item: any) => {
        this.setState({
            isModalVisible: true,
            modalType: '2',
            curEdit: item,
        }, () => {
            this.form.setFieldsValue(item);
        });
        
    };
    
    onHandleAdd = () => {
        this.setState({
            isModalVisible: true,
            modalType: '1',
        });
    };
    
    onHandleCancel = () => {
        this.setState({ isModalVisible: false, fundKey: '' });
    };
    
    onHandleOk = () => {
        const { fundKey, curEdit } = this.state as any;
        const cacheData = this.cacheData;
        
        // 新增
        if (this.state.modalType === '1') {
            const hasData = !!cacheData[ fundKey ];
            
            if (hasData) {
                return message.error('当前基金以及存在了哦！');
            }
            
            cacheData[ fundKey ] = {
                // 持仓份额
                share: 0,
                // 持仓成本
                cost: 0,
            };
        } else {
            cacheData[ curEdit.key ] = this.form.getFieldsValue();
        }
        
        setCache('data-list', cacheData);
        
        message.success('操作成功');
        
        this.cacheData = cacheData;
        
        this.form && this.form.resetFields();
        this.setState({
            isModalVisible: false,
            fundKey: '',
            curEdit: {},
        });
        
        ipcRenderer.send('web-onload', this.cacheData);
    };
    
    onFundKeyChange = (ev: any) => {
        this.setState({ fundKey: ev.target.value });
    };
    
    onDelete = (item: any) => {
        delete this.cacheData[ item.key ];
        
        console.log(this.cacheData);
        setCache('data-list', this.cacheData);
        ipcRenderer.send('web-onload', this.cacheData);
    };
    
    getStyleName(value: number | string) {
        return value.toString().indexOf('-') > -1 ? 'green' : 'red';
    }
    
    getPrivacyStr(str: string | number) {
        return this.cacheConfig.privacy ? '**' : str;
    }
    
    render() {
        const { settingVisible, modalType, fundKey, isModalVisible, dataList, settingList } = this.state;
        const { simple } = this.cacheConfig;
        
        console.log(dataList);
        return (
            <div className="container">
                <div className="header bg">
                    <div className="left">
                        <span><Clock/></span>
                        
                        <Button style={ { marginLeft: 20 } } onClick={ this.onHandleAdd }>添加基金</Button>
                    </div>
                    <div className="right">
                        <img onClick={ () => this.setVisible(true) }
                             src="http://img.chuansroom.com/fundManager/setting.png"
                             alt=""/>
                    </div>
                </div>
                
                <div className="m-content-list">
                    { simple ?
                        (
                            <List
                                itemLayout="horizontal"
                                dataSource={ dataList }
                                renderItem={ (item: any) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={ (
                                                <div className="item">
                                                    <span className="left">{ item.name }</span>
                                                    <p>
                                                        <span style={ { paddingRight: 10 } }>{ item.calculatingTime }</span>
                                                        <span className={ `right ${ this.getStyleName(item.calculatingIncrease) }` }>{ item.calculatingIncrease }</span>
                                                    </p>
                                                
                                                </div>
                                            ) }
                                        />
                                    </List.Item>
                                ) }
                            />
                        )
                        :
                        dataList.map((item: any) => {
                            // 资金总额
                            const totalAmount = Number(item.share) * Number(item.unitNetWorth);
                            // 今日收益
                            const todayIncomeAmount = Number(item.calculatingNetWorthIncrease) * Number(item.share);
                            const totalIncomeAmount = (Number(item.calculatingNetWorth) - Number(item.cost)) * Number(item.share);
                            
                            
                            return (
                                <Card key={ item.key } style={ { marginBottom: 15 } } title={ (
                                    <div className="card-title">
                                        <p>{ item.name }</p>
                                        <div>
                                            <Button
                                                type="dashed"
                                                style={ { marginRight: 10 } }
                                                onClick={ () => this.onHandleEdit(item) }
                                            >编辑</Button>
                                            <Popconfirm
                                                title="您确定要删除该基金吗？"
                                                onConfirm={ () => this.onDelete(item) }
                                                placement="left"
                                                okText="清仓剁手"
                                                cancelText="加仓ing"
                                            >
                                                <Button type="dashed" danger>删除</Button>
                                            </Popconfirm>
                                        </div>
                                    </div>
                                ) } bordered={ false }>
                                    <div className="content">
                                        <div className="left">
                                            <p className="p1">净值估算 <span>{ item.calculatingTime }</span></p>
                                            <p className={ `p2 ${ this.getStyleName(item.calculatingIncrease) }` }>{ item.calculatingIncrease }</p>
                                            <p className={ `p3 ${ this.getStyleName(item.calculatingIncrease) }` }>
                                                <span>净值 <span>{ item.calculatingNetWorth }</span></span>
                                                <span>涨幅 <span>{ item.calculatingNetWorthIncrease }</span></span>
                                            </p>
                                        </div>
                                        <div className="middle">
                                            <p className="p1">单位净值 <span>{ item.unitNetWorthTime }</span></p>
                                            <p className={ `p2 ${ this.getStyleName(item.unitNetWorthIncrease) }` }>{ item.unitNetWorthIncrease }</p>
                                            <p className={ `p5 ${ this.getStyleName(item.unitNetWorth) }` }>
                                                净值 <span>{ item.unitNetWorth }</span>
                                            </p>
                                        </div>
                                        
                                        <div className="right">
                                            <p className="p1">预计收益 <span>{ item.calculatingTime }</span></p>
                                            <div className="p4">
                                                <div className="l">
                                                    <p>今日</p>
                                                    <p className={ `red ${ this.getStyleName(todayIncomeAmount) }` }>{ this.getPrivacyStr(todayIncomeAmount.toFixed(2)) }</p>
                                                </div>
                                                <div className="r">
                                                    <p>累计</p>
                                                    <p className={ `red ${ this.getStyleName(totalIncomeAmount) }` }>{ this.getPrivacyStr(totalIncomeAmount.toFixed(2)) }</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="footer">
                                        <p>持仓份额：<span>{ this.getPrivacyStr(item.share) }</span></p>
                                        <p>持仓成本：<span>{ item.cost }</span></p>
                                        <p>资金总额：<span>{ this.getPrivacyStr(totalAmount.toFixed(2)) }</span></p>
                                    </div>
                                </Card>
                            );
                        })
                    }
                
                </div>
                
                <Drawer
                    title="设置选项"
                    placement="left"
                    closable={ false }
                    width={ 350 }
                    onClose={ () => this.setVisible() }
                    visible={ settingVisible }
                    className="m-setting-container"
                >
                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        dataSource={ settingList }
                        renderItem={ (item: any) => (
                            <List.Item
                                actions={ item.actions }
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar src={ item.icon }/>
                                    }
                                    title={ <a href="https://ant.design">{ item.title }</a> }
                                    description={ item.desc }
                                />
                            </List.Item>
                        ) }
                    />
                    <p style={ { paddingTop: 20, color: 'red' } }>数据来源于天天基金，可能与真实数据有一定的误差，请知晓</p>
                </Drawer>
                
                <Modal title="基金编辑"
                       width={ 350 }
                       okText="确定"
                       cancelText="取消"
                       visible={ isModalVisible }
                       onOk={ this.onHandleOk }
                       onCancel={ this.onHandleCancel }>
                    
                    { modalType === '2' ? (
                        <Form
                            ref={ (form => this.form = form) }
                            name="edit"
                            initialValues={ { share: 0, cost: 0 } }
                        >
                            <Form.Item
                                label="持仓份额"
                                name="share"
                                rules={ [ { required: true, message: '最少为0' } ] }
                            >
                                <InputNumber style={ { width: 200 } }/>
                            </Form.Item>
                            
                            <Form.Item
                                label="持仓成本"
                                name="cost"
                                rules={ [ { required: true, message: '最少为0' } ] }
                            >
                                <InputNumber style={ { width: 200 } }/>
                            </Form.Item>
                            
                            <p style={ {
                                fontSize: 13,
                                color: 'red',
                            } }>注意：为了保证数据计算的准确性，请输入正确的值，具体值可以在基金详情里面查看，本服务不会将数据上传到远程，请放心使用</p>
                        </Form>
                    ) : (
                        <Form.Item
                            label="基金编号"
                        >
                            <Input onChange={ this.onFundKeyChange } value={ fundKey } style={ { width: 200 } }/>
                        </Form.Item>
                    
                    ) }
                </Modal>
            </div>
        );
    }
}

export default App;
