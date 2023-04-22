class Depend {
    constructor(){
        this.reativeFns = new Set()    // 使用set来保存而不是数组 避免同一个函数里用到属性被重复添加 
    }
    addDepend(reativeFns) {
        this.reativeFns.add(reativeFns)
    }
    notify(){
        this.reativeFns.forEach((fn)=>{
            fn()
        })
    }
}
// 封装响应式函数
let activeReactiveFn = null
function watchFn(fn) {
    activeReactiveFn = fn
    fn()
    // activeReactiveFn = null
}
// 封装一个获取depend的函数
const targetMap = new WeakMap()
function getDepend(target,key){
    let map = targetMap.get(target)     // 从weakmap结构里找存储的map值
    if(!map) {
        map = new Map()
        targetMap.set(target,map)
    }

    let depend = map.get(key)           // 从map对象中找存储的key的值
    if(!depend){
        depend = new Depend()
        map.set(key,depend)
    }
    return depend
}

function Observe(obj){
    return new Proxy(obj,{
        get(target,key,receiver) {
            // 根据target和key获取对应的depend
            const depend = getDepend(target,key)
            // 给depend对象中添加响应函数
            depend.addDepend(activeReactiveFn)
            return Reflect.get(target,key,receiver)
        },
        set(target,key,newValue,receiver){
            Reflect.set(target,key,newValue,receiver)
            const depend = getDepend(target,key)
            depend.notify()     // 相当于通知更新视图
        }
    })
}

const obj = {
    name: 'why',
    age: 18
}
const objProxy = Observe(obj)

const info = {
    address:'广州市',
    height:1.88
}
const infoProxy  = Observe(info)

watchFn(()=>{
    console.log(infoProxy.address);
    console.log(infoProxy.height);
})
infoProxy.height = 2.88

//    Vue中的 data 中每个属性都会被创建一个Dep对象,并且解析el时进行视图的初始化如果html中有多个地方
//       用到该属性,则每个地方会将生成一个Watcher的实例放入到该属性对应Dep实例的subs数组
//         当属性发生变化时,Observe监听到属性的变化,然后调用该属性对应Dep实例的notify方法
//           然后notify方法会对Dep实例中的数组进行遍历同时调用 更新视图
// 
//    Vue2与Vue3不同的地方就是在Observe里面 分别是defineproperty和new proxy
//      Dep为发布者     Watcher为订阅者

//      数据劫持 + 发布订阅者模式       
//         当数据发送改变的时候通过发布订阅者模式来进行通知 更新视图

// vue2 缺点 新增属性 无法监听到只能用Vue.$set() 实际上就是新增属性后Vue绑定在调用一次Object.definedProperty













