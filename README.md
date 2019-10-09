# 用法
```
yarn build
yarn code 10390 userCenter c
10390: 模块id
userCenter: 模块名称
c: 样式前缀(非必传)
```

参考文件:
"src/test/index.test.ts"


## 常规用法

### 分组件
可以参考文件 : src/code-generators/index#divideLayout
如果className以com_开头,则切分组件;