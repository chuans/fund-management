/**
 * Created by Chuans on 2021/1/25
 * Author: Chuans
 * Github: https://github.com/chuans
 * Time: 下午8:42
 * Desc:
 */

// 获取缓存
export const getCache = (key: string, initData: any) => {
    const value = window.localStorage.getItem(key);
    
    if (!value) {
        return initData;
    }
    
    return JSON.parse(value);
};


// 缓存数据
export const setCache = (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
};
