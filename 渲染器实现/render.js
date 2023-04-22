// 生成虚拟节点
const h = (tag,props,children)=>{
    // vnode -> 就是一个JS对象
    return {
        tag,
        props,
        children,
    }
}

// 将虚拟节点放到网页上
const mount = (vnode,container) => {
    // vnode.el意思是vnode上面也会保留一份真实的dom

    // 1.创建真实元素
    const el = vnode.el =  document.createElement(vnode.tag)

    // 2.处理props
    if(vnode.props){
        for(let key in vnode.props){
            const value = vnode.props[key]

            if(key.startsWith('on')){
                el.addEventListener(key.slice(2).toLowerCase(),value)
            }else{
                
                 el.setAttribute(key,value)
            }

        }
    }

    // 3.处理children 
    if(vnode.children){
        if(typeof vnode.children === 'string'){
            el.textContent = vnode.children
        }else{
            vnode.children.forEach(item => {
                mount(item,el)
            })
        }
    }

    // 4.将el挂载到container
    container.appendChild(el)
}

// 对比虚拟节点
const patch = (n1,n2) =>{
    // 比较两个虚拟节点的类型是不是一样的
    if(n1.tag !== n2.tag){
        // 如果类型都不一样 就直接暴力替换掉就行了
        const n1ElParent = n1.el.parentElement
        n1ElParent.removeChild(n1.el)
        mount(n2,n1ElParent)
    }else{
        // 1.取出element对象 并且在n2中保存
        const el= n2.el = n1.el

        // 2.处理props
        const oldProps = n1.props || {}
        const newProps = n2.props || {}
        // 2.1 获取所有的newprops放到el
        for(const key in newProps){
            const oldValue = oldProps[key]
            const newValue = newProps[key]
            if(newValue !== oldValue){
                if(key.startsWith('on')){
                    el.addEventListener(key.slice(2).toLowerCase(),newValue)
                }else{
                     el.setAttribute(key,newValue)
                }
            }
        }
        // 2.2 删除所有的旧的props
        for(const key in oldProps){
            if(!(key in newProps)){
                if(key.startsWith('on')){
                    const value = oldProps[key]
                    el.removeEventListener(key.slice(2).toLowerCase(),value)
                }else{
                     el.removeAttribute(key)
                }
            }
        }

        // 3.处理children
        const oldChildren = n1.children||[]
        const newChildren = n2.children||[]

        if(typeof newChildren === 'string'){
            if(newChildren !== oldChildren){
                el.textContent = newChildren
            }else{
                el.innerHTML = newChildren
            }
        }else{  
            if(typeof oldChildren ==='string'){
                el.innerHTML = ""
                newChildren.forEach(item => {
                    mount(item,el)
                })
            }else{
                // oldChildren:[v1,v2,v3]
                // newChildren:[v1,v5,v6,v8,v9]
                // 1.前面有相同节点的元素进行patch操作
                const commonLength = Math.min(oldChildren.length,newChildren.length)
                for(let i = 0;i < commonLength;i++){
                    patch(oldChildren[i],newChildren[i])
                }

                // 2.newChildren > oldChildren
                if(newChildren.length > oldChildren.length){
                    newChildren.slice(oldChildren.length).forEach(item => {
                        mount(item.el)
                    })
                }

                // 3.oldChildren < newChildren
                if(newChildren.length < oldChildren.length){
                    oldChildren.slice(newChildren.length).forEach(item => {
                        el.removeChild(item.el)
                    })
                }
            }
        }
    }
}






