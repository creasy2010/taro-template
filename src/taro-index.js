module.exports = function (layoutData, opts ,baseName) {
  if (layoutData.attrs.className === 'root') {
    layoutData = layoutData.children[0];
  }
  const renderData = {};
  const {_, helper, prettier} = opts;
  const {printer, utils} = helper;
  const _line = helper.utils.line;

  const COMPONENT_TYPE_MAP = {
    link: 'View',
    video: 'video',
    expview: 'View',
    scroller: 'ScrollView',
    slider: 'Swiper',
    view: 'View',
    text: 'Text',
    picture: 'Image'
  };

  const line = (content, level) => utils.line(content, {indent: {space: level * 2}});
  const styleMap = {};
  const scriptMap = {
    created: '',
    detached: '',
    methods: {}
  };
  let modConfig = layoutData.modStyleConfig || {  //控制设备宽高
    designWidth: 750,
    designHeight: 1334
  };

  let openCode = {
    start: [],
    end: []
  };
  let componentType = [];
  let _rImport = [
    _line("import Taro, { Component, Config } from '@tarojs/taro';", {indent: {tab: 0}})
  ];
  openCode.end.push(
    _line(")", {indent: {tab: 2}}),
    _line("}", {indent: {tab: 1}}),
    _line("}", {indent: {tab: 0}})
  );
  openCode.start = _rImport;
  //度量单位转换
  const normalizeStyleValue = (key, value) => {
    switch (key) {
      case 'font-size':
      case 'margin-left':
      case 'margin-top':
      case 'margin-right':
      case 'margin-bottom':
      case 'padding-left':
      case 'padding-top':
      case 'padding-right':
      case 'padding-bottom':
      case 'max-width':
      case 'width':
      case 'height':
      case 'border-width':
      case 'border-radius':
      case 'top':
      case 'left':
      case 'right':
      case 'bottom':
      case 'line-height':
      case 'letter-spacing':
      case 'border-top-right-radius':
      case 'border-top-left-radius':
      case 'border-bottom-left-radius':
      case 'border-bottom-right-radius':
        value = '' + value;
        value = value.replace(/(rem)|(px)/, '');
        value = (Number(value) * 750) / modConfig.designWidth;
        value = '' + value;

        if (value.length > 3 && value.substr(-3, 3) == 'rem') {  //度量单位转换
          value = value.slice(0, -3) + 'px';
        } else {
          value += 'px';
        }
        break;
      default:
        break;
    }
    return value;
  };

  const parseStyleObject = style =>
    Object.entries(style)
      .filter(([, value]) => value || value === 0)
      .map(([key, value]) => {
        key = _.kebabCase(key);
        return `${key}: ${normalizeStyleValue(key, value)};`;
      });

  const renderStyleItem = (className, style) => [
    line(`.${className} {`),
    ...parseStyleObject(style).map(item => line(item, 1)),
    line('}')
  ];

  const renderStyle = map =>
    [].concat(
      ...Object.entries(map).map(([className, style]) =>
        renderStyleItem(className, style)
      )
    );

  const normalizeTemplateAttrValue = value => {
    if (typeof value === 'string') {
      return JSON.stringify(value);
    } else {
      return `"${JSON.stringify(value)}"`;
    }
  };

  const renderTemplateAttr = (key, value) =>
    `${key}=${normalizeTemplateAttrValue(value)}`;
  const getFuncBody = content => {
    if (content) {
      return content.match(
        /(?:\/\*[\s\S]*?\*\/|\/\/.*?\r?\n|[^{])+\{([\s\S]*)\};$/
      )[1];
    }
    return '';
  };
  let depth = 0;
  let {dataBindingStore} = layoutData;

  const getScriptStore = originJson => {
    return originJson.eventStore && originJson.scriptStore
      ? (originJson.eventStore || []).map(v => {
        const contentStore = (originJson.scriptStore || []).find(
          _v => _v.id === v.scriptId
        );
        return {
          belongId: v.belongId,
          content: contentStore.content,
          eventType: v.type,
          scriptName: contentStore.name
        };
      })
      : originJson.scriptStore || [];
  };

  let scriptStore = getScriptStore(layoutData);

  const renderTemplate = (obj, level = 3) => {
    depth = depth + 1;

    if (Array.isArray(scriptStore)) {
      // 事件绑定
      if (scriptStore.length > 0) {
        scriptStore.forEach(
          ({belongId, eventType, scriptName, content}, index) => {
            if (belongId === obj.id) {
              if (depth === 1) {
                if (eventType === 'init') {
                  scriptMap.created = `
                  function () {
                    ${getFuncBody(content)}
                  }
                `;
                } else if (eventType === 'destroy') {
                  scriptMap.detached = `
                  function () {
                    ${getFuncBody(content)}
                  }
                `;
                }
              }
              if (eventType === 'onClick') {
                scriptMap.methods.onTap = `
                function () {
                  ${getFuncBody(content)}
                }
              `;
                obj.attrs.bindtap = 'onTap';
              }
              if (eventType === 'helper') {
                scriptMap.methods[scriptName] = `
                function () {
                  ${getFuncBody(content)}
                }
              `;
              }
            }
          }
        );
      }
    }
    // 数据绑定
    let domDataBinding = [];
    if (Array.isArray(dataBindingStore)) {
      domDataBinding = dataBindingStore.filter(v => {
        if (v.belongId == obj.id) {
          if (v.value && v.value.isStatic) {
            return true;
          } else {
            if (v.value) {
              const source = v.value.source;
              const sourceValue = v.value.sourceValue;
              if (source && sourceValue) {
                return true;
              }
            }
            return false;
          }
        }
      });
    }
    // console.log(`${obj.id}的数据绑定对象`, domDataBinding);
    // 处理changetype
    // obj.element = obj.changeType === 'video' ? obj.changeType : obj.componentType;
    obj.element = COMPONENT_TYPE_MAP[obj.componentType] || obj.componentType;

    if (componentType.indexOf(obj.element) === -1) {
      componentType.push(obj.element)
    }

    if (!obj.style) obj.style = {};
    if (!obj.attrs) obj.attrs = {};

    if (obj.style.borderWidth) {
      obj.style.boxSizing = 'border-box';
    }

    if (obj.type && obj.type.toLowerCase() === 'repeat') {
      obj.style.display = 'flex';
      obj.style.flexDirection = 'row';
      obj.children.forEach(function (child) {
        delete child.style.marginTop;
      });
    }

    domDataBinding.map(item => {
      const target = item.target[0];
      if (item.value.isStatic) {
        // 静态数据
        obj.attrs[target] = item.value.value;
      } else {
        const sourceValue = item.value.sourceValue;
        let value = '';
        if (Array.isArray(sourceValue)) {
          value = sourceValue
            .map(item => {
              if (item.type === 'DYNAMIC') {
                return `{{${item.value.slice(2, -1)}}}`;
              }
              return item.value;
            })
            .join('');
        } else {
          // 通过schema绑定 @TODO
          value = `{{${item.value.source}.${item.value.sourceValue}}}`;
        }
        if (target === 'show') {
          obj.attrs['wx:if'] = value;
        } else if (target === 'innerText') {
          obj.innerText = value;
        } else {
          obj.attrs[target] = value;
        }
      }
    });
    switch (obj.element) {
      case 'view':
        obj.element = 'view';
        obj.style.display = 'flex';
        break;
      case 'picture':
        obj.element = 'image';
        obj.children = null;
        break;
      case 'text':
        obj.children = obj.innerText;
        break;
    }

    if (obj.style.lines == 1 || obj.attrs.lines == 1) {
      delete obj.style.width;
    }

    delete obj.style.lines;
    delete obj.attrs.x;
    delete obj.attrs.y;
    if (obj.attrs.className) {
      obj.attrs.class = _.kebabCase(obj.attrs.className);
      delete obj.attrs.className;
    }
    if (obj.attrs.source && obj.attrs.src) {
      obj.attrs.src = obj.attrs.source;
      delete obj.attrs.source;
    }
    obj.attrs.class = `${obj.attrs.class}`;
    styleMap[obj.attrs.class] = {
      ...styleMap[obj.attrs.class],
      ...obj.style
    };

    let ret = [];
    let nextLine = '';
    const attrs = Object.entries(obj.attrs).filter(([key, value]) => {
      if (obj.element === 'image') {
        return ['class', 'src'].includes(key);
      } else if (obj.element === 'video') {
        return [
          'class',
          'src',
          'controls',
          'autoplay',
          'muted',
          'poster'
        ].includes(key);
      }
      return key === 'class';
    });
    if (attrs.length > 3) {
      ret.push(line(`<${obj.element}`, level));
      ret = ret.concat(
        attrs.map(([key, value]) =>
          line(renderTemplateAttr(key, value), level + 1)
        )
      );
    } else {
      nextLine = `<${obj.element}`;
      if (attrs.length) {
        nextLine += ` ${attrs
          .map(([key, value]) => renderTemplateAttr(key, value))
          .join(' ')}`;
      }
    }
    if (obj.children) {
      if (Array.isArray(obj.children) && obj.children.length) {
        // 多行 Child
        ret.push(line(`${nextLine}>`, level));
        ret = ret.concat(
          ...obj.children.map(o => renderTemplate(o, level + 1))
        );
        ret.push(line(`</${obj.element}>`, level));
      } else {
        // 单行 Child
        ret.push(line(`${nextLine}>${obj.children}</${obj.element}>`, level));
      }
    } else {
      // 自闭合标签
      ret.push(line(`${nextLine} />`, level ));
    }

    return ret;
  };

  const renderDataText = renderTemplate(layoutData);
  const ConName = baseName.split('-').reduce((a ,b)=> a + b.charAt(0).toUpperCase() + b.slice(1),'');
  const comTexts = componentType.reduce((prev, next) => prev + ' , ' + next);

  openCode.start.push(
    _line(`import { ${comTexts} } from '@tarojs/components';`, {indent: {tab: 0}}),
    _line("import './index.less'", {indent: {tab: 0}}),
    _line("", {indent: {tab: 0}}),
    _line(`export default class ${ConName} extends Component {", {indent: {tab: 0}})`),
    _line("constructor(props) {", {indent: {tab: 1}}),
    _line("super(props);", {indent: {tab: 2}}),
    _line("}", {indent: {tab: 1}}),
    _line("", {indent: {tab: 0}}),
    _line("render() {", {indent: {tab: 1}}),
    _line("let { main } = this.props;", {indent: {tab: 2}}),
    _line("return (", {indent: {tab: 2}})
  );

  renderData.tsx = printer([...openCode.start, ...renderDataText, ...openCode.end]);

  renderData.less = printer(renderStyle(styleMap));

  return {
    renderData,
    prettierOpt: {},
    openCode, // 对外接口暴露的dsl相关代码
    panelDisplay: [
      {
        panelName: 'component.tsx',
        panelValue: renderData.tsx,
        panelType: 'BuilderRaxView',
        mode: 'tsx'
      },
      {
        panelName: 'component.less',
        panelValue: renderData.less,
        panelType: 'BuilderRaxStyle',
        mode: 'less'
      }
    ],
    noTemplate: true
  };
};
